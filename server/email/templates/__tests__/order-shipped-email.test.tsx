/**
 * @jest-environment node
 *
 * Renders the React Email component with `renderToStaticMarkup` (no dynamic
 * import, unlike `@react-email/render`) to assert on the produced markup —
 * tracking number, items, links, escaping.
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { OrderShippedEmail, type OrderShippedEmailProps } from '../order-shipped-email'

const baseProps: OrderShippedEmailProps = {
  orderNumber: 'ORD-123-ABC',
  trackingNumber: 'TRACK-999',
  items: [
    {
      name: 'Barometer Mug',
      variantInfo: { Color: 'Blue', Size: 'L' },
      quantity: 2,
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

const renderHtml = (props: OrderShippedEmailProps) =>
  renderToStaticMarkup(createElement(OrderShippedEmail, props))

describe('OrderShippedEmail', () => {
  it('includes the order number', () => {
    expect(renderHtml(baseProps)).toContain('ORD-123-ABC')
  })

  it('shows the tracking number when present', () => {
    expect(renderHtml(baseProps)).toContain('TRACK-999')
  })

  it('omits the tracking block when no tracking number is set', () => {
    const html = renderHtml({ ...baseProps, trackingNumber: null })
    expect(html).not.toContain('Tracking number')
  })

  it('renders item name, variant info and quantity', () => {
    const html = renderHtml(baseProps)
    expect(html).toContain('Barometer Mug')
    expect(html).toContain('(Color: Blue, Size: L)')
    expect(html).toContain('2')
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
      items: [{ name: '<script>alert(1)</script>', variantInfo: null, quantity: 1 }],
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

  it('uses shipped copy by default', () => {
    const html = renderHtml(baseProps)
    expect(html).toContain('Your order is on its way!')
    expect(html).toContain('has been shipped')
  })

  it('uses tracking-updated copy for the tracking-updated variant', () => {
    const html = renderHtml({ ...baseProps, variant: 'tracking-updated' })
    expect(html).toContain('Tracking number updated')
    expect(html).toContain('has been updated')
    expect(html).not.toContain('has been shipped')
  })
})
