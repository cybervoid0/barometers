import 'server-only'

import { render } from '@react-email/render'
import { createElement } from 'react'
import { prisma } from '@/prisma/prismaClient'
import { type SendEmailResult, sendEmail } from '@/services/email'
import {
  OrderConfirmationEmail,
  type OrderConfirmationEmailProps,
} from './templates/order-confirmation-email'

/** Builder input — the email's data without the injected `baseUrl`. */
export type OrderConfirmationData = Omit<OrderConfirmationEmailProps, 'baseUrl'>

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://barometers.info'

/**
 * Render the order confirmation email (subject + HTML + plain text) from the
 * React Email template. HTML/text generation and escaping are handled by
 * React Email's renderer.
 */
export async function buildOrderConfirmationEmail(data: OrderConfirmationData): Promise<{
  subject: string
  html: string
  text: string
}> {
  const element = createElement(OrderConfirmationEmail, { ...data, baseUrl })
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })])

  return { subject: `Order confirmation — ${data.orderNumber}`, html, text }
}

/**
 * Fetch an order and send its confirmation email.
 * Returns a {@link SendEmailResult}; never throws so the caller (webhook) is
 * never aborted by a mail failure.
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<SendEmailResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { name: true } } } },
      shippingAddress: true,
      customer: { select: { userId: true } },
    },
  })

  if (!order) {
    console.error(`[email] Order ${orderId} not found — cannot send confirmation`)
    return { sent: false, error: 'Order not found' }
  }

  const recipient = order.shippingAddress.email
  if (!recipient) {
    console.error(`[email] Order ${orderId} has no recipient email`)
    return { sent: false, error: 'No recipient email' }
  }

  const { subject, html, text } = await buildOrderConfirmationEmail({
    orderNumber: order.orderNumber,
    currency: order.currency,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    tax: order.tax,
    total: order.total,
    items: order.items.map(item => ({
      name: item.product.name,
      variantInfo: item.variantInfo as Record<string, string> | null,
      quantity: item.quantity,
      priceAtTime: item.priceAtTime,
    })),
    shippingAddress: order.shippingAddress,
    isGuest: order.customer.userId === null,
  })

  return sendEmail({
    to: recipient,
    subject,
    html,
    text,
    idempotencyKey: `order-confirmation/${order.id}`,
  })
}
