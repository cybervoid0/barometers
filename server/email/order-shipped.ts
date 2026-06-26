import 'server-only'

import { render } from '@react-email/render'
import { createElement } from 'react'
import { prisma } from '@/prisma/prismaClient'
import { type SendEmailResult, sendEmail } from '@/services/email'
import { OrderShippedEmail, type OrderShippedEmailProps } from './templates/order-shipped-email'

/** Builder input — the email's data without the injected `baseUrl`. */
export type OrderShippedData = Omit<OrderShippedEmailProps, 'baseUrl'>

type ShipmentVariant = NonNullable<OrderShippedEmailProps['variant']>

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://barometers.info'

const SUBJECT: Record<ShipmentVariant, (orderNumber: string) => string> = {
  shipped: orderNumber => `Your order has shipped — ${orderNumber}`,
  'tracking-updated': orderNumber => `Tracking number updated — ${orderNumber}`,
}

/**
 * Render the shipment email (subject + HTML + plain text) from the React Email
 * template. HTML/text generation and escaping are handled by React Email's
 * renderer. The `variant` selects between the first shipped notice and a
 * follow-up "tracking number updated" notice.
 */
export async function buildOrderShippedEmail(data: OrderShippedData): Promise<{
  subject: string
  html: string
  text: string
}> {
  const variant = data.variant ?? 'shipped'
  const element = createElement(OrderShippedEmail, { ...data, baseUrl })
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })])

  return { subject: SUBJECT[variant](data.orderNumber), html, text }
}

/**
 * Fetch an order and send a shipment notification to the customer (works for
 * guests and registered users alike, via the shipping address email).
 *
 * - `variant: 'shipped'` (default) — the one-time "your order has shipped" mail,
 *   keyed `order-shipped/<id>` so it is sent at most once.
 * - `variant: 'tracking-updated'` — a follow-up when the tracking number is
 *   added or corrected, keyed by the new value so each distinct change sends but
 *   re-saving the same value within 24h does not.
 *
 * Returns a {@link SendEmailResult}; never throws so the caller (admin action)
 * is never aborted by a mail failure.
 */
export async function sendOrderShippedEmail(
  orderId: string,
  variant: ShipmentVariant = 'shipped',
): Promise<SendEmailResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { name: true } } } },
      shippingAddress: true,
      customer: { select: { userId: true } },
    },
  })

  if (!order) {
    console.error(`[email] Order ${orderId} not found — cannot send shipment notification`)
    return { sent: false, error: 'Order not found' }
  }

  const recipient = order.shippingAddress.email
  if (!recipient) {
    console.error(`[email] Order ${orderId} has no recipient email`)
    return { sent: false, error: 'No recipient email' }
  }

  const { subject, html, text } = await buildOrderShippedEmail({
    orderNumber: order.orderNumber,
    trackingNumber: order.trackingNumber,
    items: order.items.map(item => ({
      name: item.product.name,
      variantInfo: item.variantInfo as Record<string, string> | null,
      quantity: item.quantity,
    })),
    shippingAddress: order.shippingAddress,
    isGuest: order.customer.userId === null,
    variant,
  })

  const idempotencyKey =
    variant === 'tracking-updated'
      ? `order-tracking/${order.id}/${encodeURIComponent(order.trackingNumber ?? '')}`
      : `order-shipped/${order.id}`

  return sendEmail({ to: recipient, subject, html, text, idempotencyKey })
}

/**
 * Convenience wrapper: notify the customer that the tracking number for an
 * already-shipped order was added or corrected.
 */
export function sendTrackingUpdatedEmail(orderId: string): Promise<SendEmailResult> {
  return sendOrderShippedEmail(orderId, 'tracking-updated')
}
