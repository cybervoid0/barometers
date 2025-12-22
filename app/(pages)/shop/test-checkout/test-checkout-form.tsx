'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createCheckoutSession } from '@/app/(pages)/shop/server/actions'
import { RequiredFieldMark } from '@/components/elements'
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Input,
} from '@/components/ui'
import {
  type TestCheckoutFormData,
  testCheckoutSchema,
  testCheckoutTransformSchema,
} from './test-checkout-schema'

function TestCheckoutForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<TestCheckoutFormData>({
    resolver: zodResolver(testCheckoutSchema),
    mode: 'onChange',
    defaultValues: {
      userId: '',
      variantId: '',
      quantity: '1',
    },
  })
  const { handleSubmit, control, formState } = form

  const onSubmit = useCallback((values: TestCheckoutFormData) => {
    startTransition(async () => {
      try {
        const transformedData = await testCheckoutTransformSchema.parseAsync(values)

        const result = await createCheckoutSession({
          userId: transformedData.userId,
          items: [
            {
              variantId: transformedData.variantId,
              quantity: transformedData.quantity,
            },
          ],
          currency: 'EUR',
          shippingAddress: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '+1234567890',
            address: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'US',
          },
        })

        if (!result.success) throw new Error(result.error)

        // Redirect to Stripe Checkout
        if (result.sessionUrl) {
          window.location.href = result.sessionUrl
        }
      } catch (error) {
        console.error('Checkout error:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create checkout')
      }
    })
  }, [])

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div className="p-6 border rounded-lg space-y-6">
          <FormField
            control={control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  User ID <RequiredFieldMark />
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Paste your user ID from database" />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Get your user ID from database (User table)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="variantId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Variant ID <RequiredFieldMark />
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Paste variant ID from database" />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Get variant ID from database (ProductVariant table)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Quantity <RequiredFieldMark />
                </FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending || !formState.isValid} className="w-full">
            {isPending ? 'Creating checkout...' : 'Checkout with Stripe'}
          </Button>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Test Cards:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>
              <strong>Success:</strong> 4242 4242 4242 4242
            </li>
            <li>
              <strong>Decline:</strong> 4000 0000 0000 0002
            </li>
            <li>
              <strong>3D Secure:</strong> 4000 0025 0000 3155
            </li>
            <li className="mt-2">Any future date, any CVC, any postal code</li>
          </ul>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Important:</h3>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>
              • Make sure Stripe CLI is running:{' '}
              <code className="text-xs">
                stripe listen --forward-to localhost:3001/api/stripe/webhook
              </code>
            </li>
            <li>• Add STRIPE_WEBHOOK_SECRET to .env.local</li>
            <li>• Restart dev server after adding webhook secret</li>
            <li>• Check terminal for webhook events</li>
          </ul>
        </div>
      </form>
    </FormProvider>
  )
}

export default TestCheckoutForm
