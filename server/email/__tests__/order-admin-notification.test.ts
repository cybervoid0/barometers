/**
 * @jest-environment node
 *
 * `@react-email/render` uses a dynamic import Jest's CJS runner can't load, so
 * it's mocked. Template markup is covered elsewhere; here we test composition,
 * recipients, and the idempotency key.
 */
jest.mock('@react-email/render', () => ({
  render: jest.fn(async (_el: unknown, opts?: { plainText?: boolean }) =>
    opts?.plainText ? 'PLAIN-TEXT-BODY' : '<html>HTML-BODY</html>',
  ),
}))
jest.mock('@/prisma/prismaClient', () => ({
  prisma: { order: { findUnique: jest.fn() } },
}))
jest.mock('@/services/email', () => ({ sendEmail: jest.fn() }))

import { prisma } from '@/prisma/prismaClient'
import { sendEmail } from '@/services/email'
import {
  buildOrderAdminNotificationEmail,
  type OrderAdminNotificationData,
  sendOrderAdminNotification,
} from '../order-admin-notification'

const findUnique = prisma.order.findUnique as jest.Mock
const sendEmailMock = sendEmail as jest.Mock

const baseData: OrderAdminNotificationData = {
  orderNumber: 'ORD-123-ABC',
  currency: 'EUR',
  subtotal: 2000,
  shippingCost: 500,
  total: 2500,
  items: [{ name: 'Barometer Mug', variantInfo: null, quantity: 1, priceAtTime: 2000 }],
  customerName: 'Jane Doe',
  customerEmail: 'jane@example.com',
  shippingAddress: {
    firstName: 'Jane',
    lastName: 'Doe',
    address: '1 High St',
    city: 'Amsterdam',
    state: null,
    postalCode: '1011',
    country: 'NL',
    phone: null,
  },
  orderId: 'order_1',
}

const orderRow = {
  id: 'order_1',
  orderNumber: 'ORD-123-ABC',
  currency: 'EUR',
  subtotal: 2000,
  shippingCost: 500,
  total: 2500,
  items: [
    { product: { name: 'Barometer Mug' }, variantInfo: null, quantity: 1, priceAtTime: 2000 },
  ],
  shippingAddress: { ...baseData.shippingAddress, email: 'jane@example.com' },
  customer: { name: 'Jane Doe', email: 'jane@example.com' },
}

const ENV_KEY = 'ORDER_NOTIFICATIONS_EMAIL'

beforeEach(() => {
  findUnique.mockReset()
  sendEmailMock.mockReset()
  sendEmailMock.mockResolvedValue({ sent: true })
  delete process.env[ENV_KEY]
})

describe('buildOrderAdminNotificationEmail', () => {
  it('composes the subject from order number and customer', async () => {
    const { subject } = await buildOrderAdminNotificationEmail(baseData)
    expect(subject).toBe('New order ORD-123-ABC — Jane Doe')
  })

  it('returns rendered html and plain-text bodies', async () => {
    const { html, text } = await buildOrderAdminNotificationEmail(baseData)
    expect(html).toBe('<html>HTML-BODY</html>')
    expect(text).toBe('PLAIN-TEXT-BODY')
  })
})

describe('sendOrderAdminNotification', () => {
  it('defaults to orders@barometers.info with a stable idempotency key', async () => {
    findUnique.mockResolvedValue(orderRow)
    await sendOrderAdminNotification('order_1')
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['orders@barometers.info'],
        idempotencyKey: 'order-admin-notify/order_1',
      }),
    )
  })

  it('honours ORDER_NOTIFICATIONS_EMAIL with multiple comma-separated recipients', async () => {
    process.env[ENV_KEY] = 'a@x.com, b@y.com'
    findUnique.mockResolvedValue(orderRow)
    await sendOrderAdminNotification('order_1')
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: ['a@x.com', 'b@y.com'] }),
    )
  })

  it('returns an error and does not send when the order is missing', async () => {
    findUnique.mockResolvedValue(null)
    const result = await sendOrderAdminNotification('missing')
    expect(result).toEqual({ sent: false, error: 'Order not found' })
    expect(sendEmailMock).not.toHaveBeenCalled()
  })
})
