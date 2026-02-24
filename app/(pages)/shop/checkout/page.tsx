'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Currency } from '@prisma/client'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Image } from '@/components/elements'
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Route } from '@/constants'
import type { ProductVariantWithProduct } from '@/types'
import { formatPrice } from '@/utils'
import { createCheckoutSession } from '../server/actions'
import { fetchVariantsByIds } from '../server/query-actions'
import { useShopCartStore } from '../stores/shop-cart-store'
import { type CheckoutFormData, checkoutSchema } from './checkout-schema'

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
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
      city: '',
      state: '',
      postalCode: '',
      country: '',
      currency: 'EUR',
    },
  })

  const { handleSubmit, control, watch } = form
  const selectedCurrency = watch('currency') as Currency

  // Redirect if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      toast.error('Please sign in to checkout')
      router.push(Route.Signin)
    }
  }, [authStatus, router])

  // Redirect if cart is empty
  useEffect(() => {
    if (authStatus === 'authenticated' && items.length === 0) {
      router.push(Route.Cart)
    }
  }, [authStatus, items.length, router])

  // Prefill email from session
  useEffect(() => {
    if (session?.user?.email) {
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

  const totals = useMemo(() => {
    let amount = 0
    for (const item of items) {
      const variant = variants.find(v => v.id === item.variantId)
      if (variant) {
        const price = selectedCurrency === 'EUR' ? variant.priceEUR : variant.priceUSD
        amount += (price ?? 0) * item.quantity
      }
    }
    return amount
  }, [items, variants, selectedCurrency])

  const onSubmit = useCallback(
    (values: CheckoutFormData) => {
      if (!session?.user?.id) {
        toast.error('Please sign in to checkout')
        return
      }

      startTransition(async () => {
        try {
          const result = await createCheckoutSession({
            items: items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
            currency: values.currency as Currency,
            shippingAddress: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              phone: values.phone || undefined,
              address: values.address,
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
    [session, items],
  )

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (authStatus === 'unauthenticated' || items.length === 0) {
    return null
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Shipping form */}
        <div className="lg:col-span-3">
          <FormProvider {...form}>
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
                        <Input {...field} />
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
                            {COUNTRIES.map(c => (
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

              <div className="border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold">Payment Currency</h2>
                <FormField
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending
                  ? 'Redirecting to Stripe...'
                  : `Pay with Stripe — ${formatPrice(totals, selectedCurrency)}`}
              </Button>
            </form>
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
                const price = selectedCurrency === 'EUR' ? variant.priceEUR : variant.priceUSD
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
                      {price ? formatPrice(price * item.quantity, selectedCurrency) : '—'}
                    </p>
                  </div>
                )
              })}
            </div>

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(totals, selectedCurrency)}</span>
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
