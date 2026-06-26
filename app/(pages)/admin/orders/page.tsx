import type { OrderStatus } from '@prisma/client'
import Link from 'next/link'
import { Badge } from '@/components/ui'
import { Route } from '@/constants'
import { formatPrice } from '@/utils'
import { getAllOrders } from '../../shop/server/queries'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

const ALL_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams
  const statusFilter = ALL_STATUSES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined

  const orders = await getAllOrders(statusFilter)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={Route.AdminOrders}
          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
            !statusFilter ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          All
        </Link>
        {ALL_STATUSES.map(status => (
          <Link
            key={status}
            href={`${Route.AdminOrders}?status=${status}`}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              statusFilter === status ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            {status}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No orders found</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold">Order</th>
                <th className="text-left p-3 font-semibold">Customer</th>
                <th className="text-left p-3 font-semibold">Date</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-right p-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <Link
                      href={`${Route.AdminOrders}${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-3">
                    <div>{order.customer.user?.name ?? order.customer.name ?? 'Guest'}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.customer.user?.email ?? order.customer.email}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Badge className={statusColors[order.status]}>{order.status}</Badge>
                  </td>
                  <td className="p-3 text-right font-medium">
                    {formatPrice(order.total, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
