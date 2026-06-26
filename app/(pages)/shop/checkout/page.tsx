'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  RequiredAwareFormLabel as FormLabel,
  Image,
  RequiredFieldsProvider,
} from '@/components/elements'
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormProvider,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@/components/ui'
import {
  calculateShippingCents,
  DEFAULT_VARIANT_WEIGHT_GRAMS,
  getShippingZone,
  Route,
  SHIPPING_COUNTRIES,
  SHIPPING_ZONE_LABEL,
} from '@/constants'
import type { ProductVariantWithProduct } from '@/types'
import { formatPrice } from '@/utils'
import { createCheckoutSession } from '../server/actions'
import { fetchVariantsByIds } from '../server/query-actions'
import { useCheckoutFormStore } from '../stores/checkout-form-store'
import { useShopCartStore } from '../stores/shop-cart-store'
import { type CheckoutFormData, checkoutSchema } from './checkout-schema'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotalItems } = useShopCartStore()
  const [variants, setVariants] = useState<ProductVariantWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  })

  const { handleSubmit, control } = form

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push(Route.Cart)
    }
  }, [isLoading, items.length, router])

  // Restore the form from the persisted store once it has hydrated, so leaving
  // the checkout page and coming back doesn't wipe what was typed. The store
  // uses skipHydration (rehydrated in the shop layout), so we wait for it.
  useEffect(() => {
    const apply = () => form.reset(useCheckoutFormStore.getState().values)
    if (useCheckoutFormStore.persist.hasHydrated()) apply()
    return useCheckoutFormStore.persist.onFinishHydration(apply)
  }, [form])

  // Persist every change so a mid-checkout navigation is non-destructive.
  useEffect(() => {
    const subscription = form.watch(values => {
      useCheckoutFormStore.getState().setValues(values as CheckoutFormData)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Prefill email from session, but only when the field is still empty so we
  // never clobber a restored or hand-edited value.
  useEffect(() => {
    if (session?.user?.email && !form.getValues('email')) {
      form.setValue('email', session.user.email)
    }
  }, [session, form])

  // Fetch variant data
  const variantIds = useMemo(
    () =>
      items
        .map(i => i.variantId)
        .sort()
        .join(','),
    [items],
  )

  useEffect(() => {
    if (!variantIds) {
      setVariants([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    fetchVariantsByIds(variantIds.split(','))
      .then(result => {
        if (result.success) {
          setVariants(result.data)
        } else {
          toast.error(result.error)
        }
      })
      .finally(() => setIsLoading(false))
  }, [variantIds])

  const subtotal = useMemo(() => {
    let amount = 0
    for (const item of items) {
      const variant = variants.find(v => v.id === item.variantId)
      if (variant) {
        amount += (variant.priceEUR ?? 0) * item.quantity
      }
    }
    return amount
  }, [items, variants])

  // Shipping is weight × destination zone — the same formula the server applies
  // when building the Stripe session (calculateShippingCents). We recompute it
  // here so the summary isn't a surprise at the payment step. It stays null
  // until a country is chosen, since the zone is unknown before then.
  const country = form.watch('country')

  const totalWeightGrams = useMemo(
    () =>
      items.reduce((sum, item) => {
        const variant = variants.find(v => v.id === item.variantId)
        const grams = variant?.weight ?? DEFAULT_VARIANT_WEIGHT_GRAMS
        return sum + grams * item.quantity
      }, 0),
    [items, variants],
  )

  const shippingCents = useMemo(
    () => (country ? calculateShippingCents(totalWeightGrams, country) : null),
    [country, totalWeightGrams],
  )

  const grandTotal = subtotal + (shippingCents ?? 0)

  const onSubmit = useCallback(
    (values: CheckoutFormData) => {
      startTransition(async () => {
        try {
          const result = await createCheckoutSession({
            items: items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
            shippingAddress: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              phone: values.phone || undefined,
              address: values.address2 ? `${values.address}\n${values.address2}` : values.address,
              city: values.city,
              state: values.state || undefined,
              postalCode: values.postalCode,
              country: values.country,
            },
          })

          if (!result.success) throw new Error(result.error)

          if (result.sessionUrl) {
            window.location.href = result.sessionUrl
          }
        } catch (error) {
          console.error('Checkout error:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to create checkout session')
        }
      })
    },
    [items],
  )

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Shipping form */}
        <div className="lg:col-span-3">
          <FormProvider {...form}>
            <RequiredFieldsProvider schema={checkoutSchema}>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                <div className="border rounded-lg p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Shipping Address</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Street address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="address2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Apartment, suite, unit, building, floor, etc."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SHIPPING_COUNTRIES.map(c => (
                                <SelectItem key={c.code} value={c.code}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                  {isPending
                    ? 'Redirecting to Stripe...'
                    : `Pay with Stripe — ${formatPrice(grandTotal)}`}
                </Button>
              </form>
            </RequiredFieldsProvider>
          </FormProvider>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg p-6 space-y-4 sticky top-4">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <p className="text-sm text-muted-foreground">{getTotalItems()} item(s)</p>

            <Separator />

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {items.map(item => {
                const variant = variants.find(v => v.id === item.variantId)
                if (!variant) return null

                const image = variant.images?.[0] ?? variant.product.images?.[0]
                const price = variant.priceEUR
                const options = variant.options as Record<string, string>

                return (
                  <div key={item.variantId} className="flex gap-3">
                    {image ? (
                      <Image
                        width={48}
                        height={48}
                        className="rounded object-cover shrink-0"
                        src={image.url}
                        alt={variant.product.name}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{variant.product.name}</p>
                      {Object.keys(options).length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {Object.entries(options)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {price ? formatPrice(price * item.quantity) : '—'}
                    </p>
                  </div>
                )
              })}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {country ? SHIPPING_ZONE_LABEL[getShippingZone(country)] : 'Shipping'}
                </span>
                <span>
                  {shippingCents === null ? (
                    <span className="text-muted-foreground">Select country</span>
                  ) : (
                    formatPrice(shippingCents)
                  )}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>

            <Link href={Route.Cart} className="text-sm text-muted-foreground hover:underline block">
              Edit cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
