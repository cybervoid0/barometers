import { releaseStalePendingOrders } from '@/app/(pages)/shop/server/order-lifecycle'

const cronSecret = process.env.CRON_SECRET
if (!cronSecret) {
  // Fail at boot rather than exposing an unauthenticated mutation endpoint.
  throw new Error('CRON_SECRET is not defined in environment variables')
}

/**
 * Periodic safety-net sweep that reclaims stock from abandoned PENDING orders
 * whose Stripe `checkout.session.expired` webhook was never delivered.
 *
 * Trigger it from a scheduler (e.g. an hourly Coolify cron) with a bearer token:
 *   curl -fsS -X POST https://barometers.info/api/cron/release-stale-orders \
 *     -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const result = await releaseStalePendingOrders()
    return Response.json({ ok: true, ...result })
  } catch (error) {
    console.error('Stale-order sweep failed:', error)
    return new Response('Sweep failed', { status: 500 })
  }
}
