import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Image } from '@/components/elements'
import { Badge, Button, Separator } from '@/components/ui'
import { Route } from '@/constants'
import { authConfig } from '@/services/auth'
import { formatPrice } from '@/utils'
import { getOrderById } from '../../server/queries'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

const ORDER_STEPS = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authConfig)

  if (!session?.user?.id) {
    redirect(Route.Signin)
  }

  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  // Verify the order belongs to this user
  if (order.customer.user.id !== session.user.id) {
    notFound()
  }

  const currentStepIndex = ORDER_STEPS.indexOf(order.status as (typeof ORDER_STEPS)[number])
  const isCancelledOrRefunded = order.status === 'CANCELLED' || order.status === 'REFUNDED'

  return (
    <div className="container py-8 max-w-3xl">
      <Link
        href={Route.Orders}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge className={statusColors[order.status]}>{order.status}</Badge>
      </div>

      {/* Status timeline */}
      {!isCancelledOrRefunded && (
        <div className="border rounded-lg p-6 mb-6">
          <h2 className="text-sm font-semibold mb-4">Order Progress</h2>
          <div className="flex items-center justify-between">
            {ORDER_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              return (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {index > 0 && (
                      <div
                        className={`h-0.5 flex-1 ${index <= currentStepIndex ? 'bg-primary' : 'bg-muted'}`}
                      />
                    )}
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        isCurrent
                          ? 'bg-primary ring-4 ring-primary/20'
                          : isCompleted
                            ? 'bg-primary'
                            : 'bg-muted'
                      }`}
                    />
                    {index < ORDER_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 ${isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
                  >
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tracking number */}
      {order.trackingNumber && (
        <div className="border rounded-lg p-4 mb-6 bg-muted/30">
          <p className="text-sm">
            <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Items</h2>
        <div className="space-y-4">
          {order.items.map(item => {
            const image = item.product.images?.[0]
            const variantInfo = item.variantInfo as Record<string, string> | null
            return (
              <div key={item.id} className="flex gap-4">
                {image ? (
                  <Image
                    width={64}
                    height={64}
                    className="rounded object-cover shrink-0"
                    src={image.url}
                    alt={item.product.name}
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  {variantInfo && Object.keys(variantInfo).length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {Object.entries(variantInfo)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  {formatPrice(item.priceAtTime * item.quantity, item.currency)}
                </p>
              </div>
            )
          })}
        </div>

        <Separator className="my-4" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(order.subtotal, order.currency)}</dd>
          </div>
          {order.shippingCost > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{formatPrice(order.shippingCost, order.currency)}</dd>
            </div>
          )}
          {order.tax > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatPrice(order.tax, order.currency)}</dd>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <dt>Total</dt>
            <dd>{formatPrice(order.total, order.currency)}</dd>
          </div>
        </dl>
      </div>

      {/* Shipping address */}
      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
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
          {order.shippingAddress.email && (
            <>
              <br />
              {order.shippingAddress.email}
            </>
          )}
        </address>
      </div>

      {/* Payment info */}
      {order.payment && (
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Payment</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{order.payment.status}</dd>
            </div>
            {order.payment.paidAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Paid on</dt>
                <dd>{new Date(order.payment.paidAt).toLocaleDateString()}</dd>
              </div>
            )}
            {order.payment.refundedAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Refunded on</dt>
                <dd>{new Date(order.payment.refundedAt).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="mt-8">
        <Link href={Route.Orders}>
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    </div>
  )
}
