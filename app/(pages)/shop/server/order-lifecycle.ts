import { CHECKOUT_SESSION_TTL_SECONDS } from '@/constants'
import { prisma } from '@/prisma/prismaClient'

/**
 * How long past a checkout session's expiry we wait before a stale PENDING
 * order is reclaimed by the sweeper. The buffer keeps the sweep from racing a
 * session that only just expired and whose `checkout.session.expired` webhook
 * is still in flight — the webhook is the normal release path; the sweep is the
 * safety net for when delivery fails entirely.
 */
const STALE_ORDER_BUFFER_MS = 60 * 60 * 1000

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

/**
 * Safety-net sweeper: cancel and release stock for PENDING orders that are
 * older than the checkout-session window plus a buffer. Normally Stripe's
 * `checkout.session.expired` webhook releases an abandoned order's stock; this
 * reclaims inventory when that webhook is never delivered (endpoint
 * misconfigured, secret rotated, Stripe disabled it after errors). By the cutoff
 * the Stripe session has long expired, so cancelling is safe.
 *
 * Idempotent: each order goes through the guarded {@link releasePendingOrder},
 * and an order that already advanced is skipped. Meant to be run periodically
 * (e.g. an hourly cron hitting /api/cron/release-stale-orders).
 *
 * @param now injectable clock (ms) for testing.
 */
export async function releaseStalePendingOrders(now = Date.now()): Promise<{ released: number }> {
  const cutoff = new Date(now - CHECKOUT_SESSION_TTL_SECONDS * 1000 - STALE_ORDER_BUFFER_MS)

  const stale = await prisma.order.findMany({
    where: { status: 'PENDING', createdAt: { lt: cutoff } },
    select: { id: true },
  })

  let released = 0
  for (const { id } of stale) {
    try {
      await releasePendingOrder(id, 'stale-order sweep')
      released += 1
    } catch (error) {
      // Never let one bad order abort the whole sweep.
      console.error(`Failed to release stale order ${id}:`, error)
    }
  }

  if (stale.length > 0) {
    console.log(`Stale-order sweep: released ${released}/${stale.length} PENDING orders`)
  }
  return { released }
}
