/**
 * @jest-environment node
 *
 * Unit-tests the builder's composition (subject + html/text wiring). The actual
 * template markup is covered in templates/__tests__/order-confirmation-email.test.tsx.
 * `@react-email/render` uses a dynamic import that Jest's CJS runner can't load,
 * so it's mocked here.
 */
jest.mock('@react-email/render', () => ({
  render: jest.fn(async (_el: unknown, opts?: { plainText?: boolean }) =>
    opts?.plainText ? 'PLAIN-TEXT-BODY' : '<html>HTML-BODY</html>',
  ),
}))
jest.mock('@/prisma/prismaClient', () => ({ prisma: {} }))
jest.mock('@/services/email', () => ({ sendEmail: jest.fn() }))

import { buildOrderConfirmationEmail, type OrderConfirmationData } from '../order-confirmation'

const baseData: OrderConfirmationData = {
  orderNumber: 'ORD-123-ABC',
  currency: 'EUR',
  subtotal: 2000,
  shippingCost: 500,
  tax: 0,
  total: 2500,
  items: [{ name: 'Barometer Mug', variantInfo: null, quantity: 1, priceAtTime: 2000 }],
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

describe('buildOrderConfirmationEmail', () => {
  it('composes the subject from the order number', async () => {
    const { subject } = await buildOrderConfirmationEmail(baseData)
    expect(subject).toBe('Order confirmation — ORD-123-ABC')
  })

  it('returns rendered html and plain-text bodies', async () => {
    const { html, text } = await buildOrderConfirmationEmail(baseData)
    expect(html).toBe('<html>HTML-BODY</html>')
    expect(text).toBe('PLAIN-TEXT-BODY')
  })
})
