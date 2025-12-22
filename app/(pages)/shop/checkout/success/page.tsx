import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { Route } from '@/constants'
import { getOrderBySessionId } from '../../server/queries'

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Session</h1>
        <p className="text-muted-foreground mb-8">No session ID provided</p>
        <Link href="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    )
  }

  const order = await getOrderBySessionId(sessionId)

  if (!order) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-8">Could not find your order</p>
        <Link href="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 max-w-2xl">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We&apos;ll send you a confirmation email shortly.
        </p>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Order Number:</dt>
              <dd className="font-medium">{order.orderNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status:</dt>
              <dd className="font-medium">{order.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total:</dt>
              <dd className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: order.currency,
                }).format(order.total / 100)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Items:</h3>
          <ul className="space-y-2">
            {order.items.map(item => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.product.name}
                  {item.variant && item.variantInfo && (
                    <span className="text-muted-foreground text-sm ml-1">
                      ({formatVariantInfo(item.variantInfo as Record<string, string>)})
                    </span>
                  )}
                  <span className="text-muted-foreground"> × {item.quantity}</span>
                </span>
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: order.currency,
                  }).format(item.priceAtTime / 100)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Shipping Address:</h3>
          <address className="not-italic text-sm text-muted-foreground">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            <br />
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city}
            {order.shippingAddress.state && `, ${order.shippingAddress.state}`}{' '}
            {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </address>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href={Route.Shop}>
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}

function formatVariantInfo(info: Record<string, string>): string {
  return Object.entries(info)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}
