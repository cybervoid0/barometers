import { prisma } from '@/prisma/prismaClient'

/**
 * Cancel a still-PENDING order and release the stock it reserved at checkout.
 *
 * The status transition is guarded (`updateMany ... where status: 'PENDING'`)
 * so this never clobbers an order that already advanced — e.g. a late
 * `checkout.session.expired` arriving after `checkout.session.completed`, which
 * Stripe does not guarantee the ordering of. Stock is only returned when THIS
 * call performed the transition, which makes it idempotent across webhook
 * retries, duplicate deliveries, and the createCheckoutSession rollback path
 * (no double-release).
 *
 * Stock is read back from the persisted `order.items` (the source of truth)
 * rather than any in-memory input, so the webhook and rollback callers share
 * one correct implementation.
 */
export async function releasePendingOrder(orderId: string, reason: string) {
  await prisma.$transaction(async tx => {
    const cancelled = await tx.order.updateMany({
      where: { id: orderId, status: 'PENDING' },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    })

    if (cancelled.count !== 1) {
      console.log(`Order ${orderId} not PENDING — no stock to release (${reason})`)
      return
    }

    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    for (const item of order?.items ?? []) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        })
      }
    }
    console.log(`Order ${orderId} CANCELLED, stock released (${reason})`)
  })
}
