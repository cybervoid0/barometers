'use client'

import { Package, Search } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge, Button, Input, Separator } from '@/components/ui'
import { Route } from '@/constants'
import { formatPrice } from '@/utils'
import { lookupGuestOrder } from '../../server/query-actions'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

type GuestOrder = Extract<Awaited<ReturnType<typeof lookupGuestOrder>>, { success: true }>['data']

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<GuestOrder | null>(null)
  const [isPending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await lookupGuestOrder({ orderNumber, email })
      if (result.success) {
        setOrder(result.data)
      } else {
        setOrder(null)
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Track your order</h1>
      <p className="text-muted-foreground mb-6">
        Enter the order number from your confirmation email and the email address you used at
        checkout.
      </p>

      <form onSubmit={onSubmit} className="border rounded-lg p-6 space-y-4 mb-8">
        <div className="space-y-1.5">
          <label htmlFor="orderNumber" className="text-sm font-medium">
            Order number
          </label>
          <Input
            id="orderNumber"
            placeholder="ORD-…"
            value={orderNumber}
            onChange={e => setOrderNumber(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          {isPending ? 'Searching…' : 'Find my order'}
        </Button>
      </form>

      {order && (
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{order.orderNumber}</h2>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className={statusColors[order.status]}>{order.status}</Badge>
          </div>

          {order.trackingNumber && (
            <div className="rounded-md bg-muted/40 p-3 text-sm">
              <span className="font-medium">Tracking number:</span> {order.trackingNumber}
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            {order.items.map(item => {
              const variantInfo = item.variantInfo as Record<string, string> | null
              return (
                <div key={item.id} className="flex justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    {variantInfo && Object.keys(variantInfo).length > 0 && (
                      <p className="text-muted-foreground">
                        {Object.entries(variantInfo)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </p>
                    )}
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">
                    {formatPrice(item.priceAtTime * item.quantity, item.currency)}
                  </p>
                </div>
              )
            })}
          </div>

          <Separator />

          <dl className="space-y-1.5 text-sm">
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
            <div className="flex justify-between font-semibold text-base pt-1">
              <dt>Total</dt>
              <dd>{formatPrice(order.total, order.currency)}</dd>
            </div>
          </dl>

          <Separator />

          <div className="text-sm">
            <h3 className="font-semibold mb-1">Shipping to</h3>
            <address className="not-italic text-muted-foreground leading-relaxed">
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
      )}

      {!order && (
        <div className="flex flex-col items-center text-center text-muted-foreground py-8">
          <Package className="w-12 h-12 mb-3 opacity-50" />
          <p>
            Have an account?{' '}
            <Link href={Route.Orders} className="text-foreground underline">
              View all your orders
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
