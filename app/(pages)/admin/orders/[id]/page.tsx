import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Image } from '@/components/elements'
import { Badge, Separator } from '@/components/ui'
import { Route } from '@/constants'
import { formatPrice } from '@/utils'
import { getOrderById } from '../../../shop/server/queries'
import { OrderStatusForm } from './order-status-form'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="p-6 max-w-4xl">
      <Link
        href={Route.AdminOrders}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge className={statusColors[order.status]}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="border rounded-lg p-6">
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
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">SKU: {item.variant.sku}</p>
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
          <div className="border rounded-lg p-6">
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
              {order.shippingAddress.phone && (
                <>
                  <br />
                  {order.shippingAddress.phone}
                </>
              )}
            </address>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <p className="font-medium">
              {order.customer.user?.name ?? order.customer.name ?? 'Guest'}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.customer.user?.email ?? order.customer.email}
            </p>
          </div>

          {/* Status management */}
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Update Status</h2>
            <OrderStatusForm
              orderId={order.id}
              currentStatus={order.status}
              currentTrackingNumber={order.trackingNumber}
              canRefund={
                !!order.stripePaymentIntentId &&
                ['PAID', 'PROCESSING', 'SHIPPED'].includes(order.status)
              }
            />
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
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd>{formatPrice(order.payment.amount, order.payment.currency)}</dd>
                </div>
                {order.payment.paidAt && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Paid</dt>
                    <dd>{new Date(order.payment.paidAt).toLocaleDateString()}</dd>
                  </div>
                )}
                {order.payment.refundAmount != null && order.payment.refundAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Refunded</dt>
                    <dd>{formatPrice(order.payment.refundAmount, order.payment.currency)}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
