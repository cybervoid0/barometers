import { Package } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Badge, Button } from '@/components/ui'
import { Route } from '@/constants'
import { authConfig } from '@/services/auth'
import { formatPrice } from '@/utils'
import { getOrdersByUserId } from '../server/queries'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

export default async function OrdersPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user?.id) {
    redirect(Route.Signin)
  }

  const orders = await getOrdersByUserId(session.user.id)

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Package className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No orders yet</h2>
          <p className="text-muted-foreground">Start shopping to see your orders here</p>
          <Link href={Route.Shop}>
            <Button>Browse Shop</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.id}
              href={`${Route.Orders}${order.id}`}
              className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{order.orderNumber}</span>
                <Badge className={statusColors[order.status]}>{order.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                <span>
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
                <span className="font-medium text-foreground">
                  {formatPrice(order.total, order.currency)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
