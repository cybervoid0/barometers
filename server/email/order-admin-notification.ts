import 'server-only'

import { render } from '@react-email/render'
import { createElement } from 'react'
import { prisma } from '@/prisma/prismaClient'
import { type SendEmailResult, sendEmail } from '@/services/email'
import {
  OrderAdminNotificationEmail,
  type OrderAdminNotificationEmailProps,
} from './templates/order-admin-notification-email'

/** Builder input — the email's data without the injected `baseUrl`. */
export type OrderAdminNotificationData = Omit<OrderAdminNotificationEmailProps, 'baseUrl'>

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://barometers.info'

/** Admin inbox(es) for new-order notifications. Comma-separated env, with a default. */
function adminRecipients(): string[] {
  return (process.env.ORDER_NOTIFICATIONS_EMAIL ?? 'orders@barometers.info')
    .split(',')
    .map(address => address.trim())
    .filter(Boolean)
}

/** Render the admin new-order notification (subject + HTML + plain text). */
export async function buildOrderAdminNotificationEmail(data: OrderAdminNotificationData): Promise<{
  subject: string
  html: string
  text: string
}> {
  const element = createElement(OrderAdminNotificationEmail, { ...data, baseUrl })
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })])

  return { subject: `New order ${data.orderNumber} — ${data.customerName}`, html, text }
}

/**
 * Fetch a paid order and notify the shop admin. Returns a {@link SendEmailResult};
 * never throws so the webhook is never aborted by a mail failure. Idempotency key
 * guards against duplicate sends on webhook retries.
 */
export async function sendOrderAdminNotification(orderId: string): Promise<SendEmailResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { name: true } } } },
      shippingAddress: true,
      customer: { select: { name: true, email: true } },
    },
  })

  if (!order) {
    console.error(`[email] Order ${orderId} not found — cannot notify admin`)
    return { sent: false, error: 'Order not found' }
  }

  const to = adminRecipients()
  if (to.length === 0) {
    console.error('[email] No admin recipients configured — skipping order notification')
    return { sent: false, error: 'No admin recipients' }
  }

  const { subject, html, text } = await buildOrderAdminNotificationEmail({
    orderNumber: order.orderNumber,
    currency: order.currency,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    items: order.items.map(item => ({
      name: item.product.name,
      variantInfo: item.variantInfo as Record<string, string> | null,
      quantity: item.quantity,
      priceAtTime: item.priceAtTime,
    })),
    customerName: order.customer.name ?? order.shippingAddress.email ?? 'Customer',
    customerEmail: order.customer.email ?? order.shippingAddress.email ?? '',
    shippingAddress: order.shippingAddress,
    orderId: order.id,
  })

  return sendEmail({
    to,
    subject,
    html,
    text,
    idempotencyKey: `order-admin-notify/${order.id}`,
  })
}
