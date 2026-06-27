import type { OrderStatus } from '@prisma/client'
import { CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { Button } from '@/components/ui'
import { Route } from '@/constants'
import { authConfig } from '@/services/auth'
import { formatPrice } from '@/utils'
import { getOrderBySessionId } from '../../server/queries'
import { ClearCartOnMount } from './clear-cart'

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

// Statuses that mean money was captured — only then do we claim success.
const PAID_STATUSES: OrderStatus[] = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Session</h1>
        <p className="text-muted-foreground mb-8">No session ID provided</p>
        <Link href={Route.Shop}>
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
        <Link href={Route.Shop}>
          <Button>Back to Shop</Button>
        </Link>
      </div>
    )
  }

  // The session_id in this URL is effectively a bearer token — it ends up in
  // browser history, server logs, and Referer headers. So we only render the
  // order's PII (shipping address + line items) to the logged-in user who owns
  // the order. Guests and anyone else holding the link get a minimal confirmation
  // and must use order-number + email tracking for the details (also emailed).
  const session = await getServerSession(authConfig)
  const isOwner = !!session?.user?.id && order.customer.userId === session.user.id
  const isLoggedIn = !!session?.user?.id

  const isPaid = PAID_STATUSES.includes(order.status)
  const isPending = order.status === 'PENDING'

  return (
    <div className="container mx-auto py-16 max-w-2xl">
      <ClearCartOnMount orderStatus={order.status} />

      <div className="text-center mb-8">
        {isPaid ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>
          </>
        ) : isPending ? (
          <>
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Payment processing…</h1>
            <p className="text-muted-foreground">
              We&apos;re still confirming your payment — this can take a moment. You&apos;ll get a
              confirmation email once it&apos;s complete, and it&apos;ll appear in your order
              history. You can safely leave this page.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Order {order.status.toLowerCase()}</h1>
            <p className="text-muted-foreground">
              This order is no longer active. Contact us if you believe this is a mistake.
            </p>
          </>
        )}

        {(isPaid || isPending) && (
          <p className="mt-4 text-sm text-muted-foreground">
            Didn&apos;t get our confirmation email? Please check your spam folder.
          </p>
        )}
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
              <dd className="font-medium">{formatPrice(order.total, order.currency)}</dd>
            </div>
          </dl>
        </div>

        {isOwner ? (
          <>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Items:</h3>
              <ul className="space-y-2">
                {order.items.map(item => {
                  const variantInfo = item.variant
                    ? formatVariantInfo(item.variantInfo as Record<string, string> | null)
                    : ''
                  return (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.product.name}
                        {variantInfo && (
                          <span className="text-muted-foreground text-sm ml-1">
                            ({variantInfo})
                          </span>
                        )}
                        <span className="text-muted-foreground"> × {item.quantity}</span>
                      </span>
                      <span>{formatPrice(item.priceAtTime, order.currency)}</span>
                    </li>
                  )
                })}
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
          </>
        ) : (
          <div className="border-t pt-4 text-sm text-muted-foreground">
            We&apos;ve emailed your order details and receipt. Keep your order number handy to look
            it up any time.
          </div>
        )}
      </div>

      {!isOwner && (
        <div className="mt-8 rounded-lg border bg-muted/30 p-6 text-center">
          <h3 className="font-semibold mb-1">Keep track of your order</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isLoggedIn
              ? 'Look it up any time with your order number and email.'
              : 'Create an account to see your orders — or look this one up with your order number and email.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {!isLoggedIn && (
              <Link href={Route.Register}>
                <Button>Create account</Button>
              </Link>
            )}
            <Link href={Route.TrackOrder}>
              <Button variant="outline">Track order</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        {isOwner && (
          <Link href={Route.Orders}>
            <Button variant="outline">View Orders</Button>
          </Link>
        )}
        <Link href={Route.Shop}>
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}

function formatVariantInfo(info: Record<string, string> | null): string {
  if (!info) return ''
  return Object.entries(info)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}
