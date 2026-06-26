/**
 * @jest-environment node
 *
 * Renders the React Email component with `renderToStaticMarkup` (no dynamic
 * import, unlike `@react-email/render`) to assert on the produced markup —
 * escaping, conditional rows, links, totals.
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  OrderConfirmationEmail,
  type OrderConfirmationEmailProps,
} from '../order-confirmation-email'

const baseProps: OrderConfirmationEmailProps = {
  orderNumber: 'ORD-123-ABC',
  currency: 'EUR',
  subtotal: 2000,
  shippingCost: 500,
  tax: 0,
  total: 2500,
  items: [
    {
      name: 'Barometer Mug',
      variantInfo: { Color: 'Blue', Size: 'L' },
      quantity: 2,
      priceAtTime: 1000,
    },
  ],
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
  baseUrl: 'https://example.com',
}

const renderHtml = (props: OrderConfirmationEmailProps) =>
  renderToStaticMarkup(createElement(OrderConfirmationEmail, props))

const countOccurrences = (haystack: string, needle: string) => haystack.split(needle).length - 1

describe('OrderConfirmationEmail', () => {
  it('includes the order number', () => {
    expect(renderHtml(baseProps)).toContain('ORD-123-ABC')
  })

  it('renders item name, variant info and quantity', () => {
    const html = renderHtml(baseProps)
    expect(html).toContain('Barometer Mug')
    expect(html).toContain('Color: Blue, Size: L')
    expect(html).toContain('Qty: 2')
  })

  it('formats line total and grand total in the correct currency', () => {
    const html = renderHtml(baseProps)
    expect(html).toContain('20,00') // 1000 × 2
    expect(html).toContain('25,00') // total
  })

  it('includes a Tax row only when tax is present', () => {
    expect(renderHtml(baseProps)).not.toContain('Tax')
    expect(renderHtml({ ...baseProps, tax: 100 })).toContain('Tax')
  })

  it('includes a Shipping row only when shipping > 0', () => {
    // "Shipping address" heading is always present: 1 = heading, 2 = + totals row.
    expect(countOccurrences(renderHtml(baseProps), 'Shipping')).toBe(2)
    expect(
      countOccurrences(renderHtml({ ...baseProps, shippingCost: 0, total: 2000 }), 'Shipping'),
    ).toBe(1)
  })

  it('always links to order tracking', () => {
    expect(renderHtml(baseProps)).toContain('/shop/orders/track')
  })

  it('shows the account CTA only for guest orders', () => {
    expect(renderHtml({ ...baseProps, isGuest: true })).toContain('/register')
    expect(renderHtml({ ...baseProps, isGuest: false })).not.toContain('/register')
  })

  it('escapes HTML in user-provided fields to prevent injection', () => {
    const html = renderHtml({
      ...baseProps,
      items: [
        { name: '<script>alert(1)</script>', variantInfo: null, quantity: 1, priceAtTime: 100 },
      ],
      shippingAddress: { ...baseProps.shippingAddress, firstName: '<b>X</b>' },
    })
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&lt;b&gt;X&lt;/b&gt;')
  })

  it('renders state in the address when present', () => {
    expect(
      renderHtml({ ...baseProps, shippingAddress: { ...baseProps.shippingAddress, state: 'NH' } }),
    ).toContain('NH')
  })
})
