'use client'

import type { OrderStatus } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  refundOrder,
  updateOrderStatus,
  updateTrackingNumber,
} from '@/app/(pages)/shop/server/actions'
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'

const STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

interface Props {
  orderId: string
  currentStatus: OrderStatus
  currentTrackingNumber: string | null
  canRefund: boolean
}

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentTrackingNumber,
  canRefund,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? '')
  const [editTracking, setEditTracking] = useState(currentTrackingNumber ?? '')
  const [isPending, startTransition] = useTransition()
  const [isRefunding, startRefundTransition] = useTransition()
  const [isSavingTracking, startTrackingTransition] = useTransition()

  // Tracking can be edited independently once the order has shipped.
  const canEditTracking = currentStatus === 'SHIPPED' || currentStatus === 'DELIVERED'

  const handleUpdateStatus = () => {
    startTransition(async () => {
      const result = await updateOrderStatus(
        orderId,
        status,
        status === 'SHIPPED' ? trackingNumber || undefined : undefined,
      )
      if (result.success) {
        toast.success(`Order status updated to ${status}`)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleSaveTracking = () => {
    startTrackingTransition(async () => {
      const result = await updateTrackingNumber(orderId, editTracking)
      if (result.success) {
        toast.success('Tracking number saved')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleRefund = () => {
    if (!confirm('Are you sure you want to issue a full refund?')) return

    startRefundTransition(async () => {
      const result = await refundOrder(orderId)
      if (result.success) {
        toast.success('Refund initiated successfully')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      <Select value={status} onValueChange={v => setStatus(v as OrderStatus)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map(s => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {status === 'SHIPPED' && (
        <Input
          placeholder="Tracking number"
          value={trackingNumber}
          onChange={e => setTrackingNumber(e.target.value)}
        />
      )}

      <Button
        className="w-full"
        onClick={handleUpdateStatus}
        disabled={isPending || status === currentStatus}
      >
        {isPending ? 'Updating...' : 'Update Status'}
      </Button>

      {canEditTracking && (
        <div className="border-t pt-4 space-y-2">
          <p className="text-sm font-medium">Tracking number</p>
          <Input
            placeholder="Tracking number"
            value={editTracking}
            onChange={e => setEditTracking(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Add, correct, or clear the tracking number. Saving a new number emails the customer.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSaveTracking}
            disabled={isSavingTracking || editTracking.trim() === (currentTrackingNumber ?? '')}
          >
            {isSavingTracking ? 'Saving...' : 'Save Tracking'}
          </Button>
        </div>
      )}

      {canRefund && (
        <div className="border-t pt-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleRefund}
            disabled={isRefunding}
          >
            {isRefunding ? 'Processing refund...' : 'Issue Full Refund'}
          </Button>
        </div>
      )}
    </div>
  )
}
