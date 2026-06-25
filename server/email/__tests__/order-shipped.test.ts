/**
 * @jest-environment node
 *
 * Unit-tests the builder's composition (subject + html/text wiring) and the
 * sender's recipient/guest handling. The actual template markup is covered in
 * templates/__tests__/order-shipped-email.test.tsx. `@react-email/render` uses
 * a dynamic import that Jest's CJS runner can't load, so it's mocked here.
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
  buildOrderShippedEmail,
  type OrderShippedData,
  sendOrderShippedEmail,
  sendTrackingUpdatedEmail,
} from '../order-shipped'

const findUnique = prisma.order.findUnique as jest.Mock
const sendEmailMock = sendEmail as jest.Mock

const baseData: OrderShippedData = {
  orderNumber: 'ORD-123-ABC',
  trackingNumber: 'TRACK-999',
  items: [{ name: 'Barometer Mug', variantInfo: null, quantity: 1 }],
  shippingAddress: {
    firstName: 'Jane',
    lastName: 'Doe',
    address: '1 High St',
    city: 'Amsterdam',
    state: null,
    postalCode: '1011',
    country: 'NL',
  },
  isGuest: false,
}

const orderRow = {
  id: 'order_1',
  orderNumber: 'ORD-123-ABC',
  trackingNumber: 'TRACK-999',
  items: [{ product: { name: 'Barometer Mug' }, variantInfo: null, quantity: 1 }],
  shippingAddress: { ...baseData.shippingAddress, email: 'jane@example.com' },
  customer: { userId: 'user_1' },
}

beforeEach(() => {
  findUnique.mockReset()
  sendEmailMock.mockReset()
  sendEmailMock.mockResolvedValue({ sent: true })
})

describe('buildOrderShippedEmail', () => {
  it('composes the subject from the order number', async () => {
    const { subject } = await buildOrderShippedEmail(baseData)
    expect(subject).toBe('Your order has shipped — ORD-123-ABC')
  })

  it('returns rendered html and plain-text bodies', async () => {
    const { html, text } = await buildOrderShippedEmail(baseData)
    expect(html).toBe('<html>HTML-BODY</html>')
    expect(text).toBe('PLAIN-TEXT-BODY')
  })

  it('uses a distinct subject for the tracking-updated variant', async () => {
    const { subject } = await buildOrderShippedEmail({ ...baseData, variant: 'tracking-updated' })
    expect(subject).toBe('Tracking number updated — ORD-123-ABC')
  })
})

describe('sendOrderShippedEmail', () => {
  it('sends to the shipping-address email with a stable idempotency key', async () => {
    findUnique.mockResolvedValue(orderRow)
    await sendOrderShippedEmail('order_1')
    expect(sendEmailMock).toHaveBeenCalledTimes(1)
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jane@example.com',
        idempotencyKey: 'order-shipped/order_1',
      }),
    )
  })

  it('returns an error and does not send when the order is missing', async () => {
    findUnique.mockResolvedValue(null)
    const result = await sendOrderShippedEmail('missing')
    expect(result).toEqual({ sent: false, error: 'Order not found' })
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('returns an error and does not send when there is no recipient email', async () => {
    findUnique.mockResolvedValue({
      ...orderRow,
      shippingAddress: { ...orderRow.shippingAddress, email: null },
    })
    const result = await sendOrderShippedEmail('order_1')
    expect(result).toEqual({ sent: false, error: 'No recipient email' })
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('keys the tracking-updated mail by order id and tracking value', async () => {
    findUnique.mockResolvedValue(orderRow)
    await sendTrackingUpdatedEmail('order_1')
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jane@example.com',
        subject: 'Tracking number updated — ORD-123-ABC',
        idempotencyKey: 'order-tracking/order_1/TRACK-999',
      }),
    )
  })

  it('url-encodes the tracking value in the idempotency key', async () => {
    findUnique.mockResolvedValue({ ...orderRow, trackingNumber: '223 322' })
    await sendTrackingUpdatedEmail('order_1')
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: 'order-tracking/order_1/223%20322' }),
    )
  })
})
