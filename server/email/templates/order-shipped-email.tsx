import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export interface OrderShippedItem {
  name: string
  variantInfo?: Record<string, string> | null
  quantity: number
}

export interface OrderShippedEmailProps {
  orderNumber: string
  /** Carrier tracking number, when available. */
  trackingNumber?: string | null
  items: OrderShippedItem[]
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state?: string | null
    postalCode: string
    country: string
  }
  /** True when the buyer checked out without an account. */
  isGuest: boolean
  /** Absolute site origin used to build links. */
  baseUrl: string
  /**
   * `shipped` — first notification when the order ships.
   * `tracking-updated` — the tracking number was added or corrected afterwards.
   */
  variant?: 'shipped' | 'tracking-updated'
}

/** Headline + intro copy per notification variant. */
const COPY = {
  shipped: {
    preview: (orderNumber: string) => `Your order ${orderNumber} has shipped`,
    heading: 'Your order is on its way!',
  },
  'tracking-updated': {
    preview: (orderNumber: string) => `Tracking number updated for order ${orderNumber}`,
    heading: 'Tracking number updated',
  },
} as const

function formatVariantInfo(info?: Record<string, string> | null): string {
  if (!info) return ''
  return Object.entries(info)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

const main = { backgroundColor: '#f6f6f4', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '8px',
  overflow: 'hidden',
}
const header = { backgroundColor: '#1a1a1a', padding: '24px 32px' }
const content = { padding: '32px' }
const footer = { backgroundColor: '#fafafa', borderTop: '1px solid #eee', padding: '20px 32px' }
const muted = { color: '#666', fontSize: '13px', margin: '0' }

export function OrderShippedEmail({
  orderNumber,
  trackingNumber,
  items,
  shippingAddress,
  isGuest,
  baseUrl,
  variant = 'shipped',
}: OrderShippedEmailProps) {
  const copy = COPY[variant]
  return (
    <Html lang="en">
      <Head />
      <Preview>{copy.preview(orderNumber)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h1" style={{ color: '#ffffff', fontSize: '18px', margin: '0' }}>
              Barometers Realm
            </Heading>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={{ fontSize: '22px', margin: '0 0 8px' }}>
              {copy.heading}
            </Heading>
            <Text style={{ color: '#444', fontSize: '15px', margin: '0 0 24px' }}>
              {variant === 'shipped' ? (
                <>
                  Good news — your order <strong>{orderNumber}</strong> has been shipped.
                </>
              ) : (
                <>
                  The tracking number for your order <strong>{orderNumber}</strong> has been
                  updated.
                </>
              )}
            </Text>

            {trackingNumber ? (
              <Section
                style={{
                  backgroundColor: '#faf7f2',
                  border: '1px solid #e8dfce',
                  borderRadius: '6px',
                  padding: '16px 20px',
                  marginBottom: '8px',
                }}
              >
                <Text style={{ ...muted, marginBottom: '4px' }}>Tracking number</Text>
                <Text
                  style={{ fontSize: '18px', fontWeight: 700, margin: '0', letterSpacing: '1px' }}
                >
                  {trackingNumber}
                </Text>
              </Section>
            ) : null}

            <Heading as="h3" style={{ fontSize: '15px', margin: '28px 0 8px' }}>
              What&rsquo;s in this shipment
            </Heading>
            {items.map(item => {
              const variant = formatVariantInfo(item.variantInfo)
              return (
                <Text
                  key={`${item.name}-${variant}`}
                  style={{ fontSize: '14px', color: '#444', margin: '0 0 6px' }}
                >
                  {item.quantity}&times; {item.name}
                  {variant ? ` (${variant})` : ''}
                </Text>
              )
            })}

            <Heading as="h3" style={{ fontSize: '15px', margin: '28px 0 8px' }}>
              Shipping to
            </Heading>
            <Text style={{ color: '#444', fontSize: '14px', margin: '0', lineHeight: '1.5' }}>
              {shippingAddress.firstName} {shippingAddress.lastName}
              <br />
              {shippingAddress.address}
              <br />
              {shippingAddress.city}
              {shippingAddress.state ? `, ${shippingAddress.state}` : ''}{' '}
              {shippingAddress.postalCode}
              <br />
              {shippingAddress.country}
            </Text>

            <Text style={{ fontSize: '14px', color: '#444', margin: '24px 0 0' }}>
              You can follow your order any time at{' '}
              <Link href={`${baseUrl}/shop/orders/track`} style={{ color: '#7a5c2e' }}>
                Track your order
              </Link>{' '}
              using order number <strong>{orderNumber}</strong> and this email address.
            </Text>

            {isGuest ? (
              <Text style={{ fontSize: '14px', color: '#444', margin: '12px 0 0' }}>
                Prefer an account?{' '}
                <Link href={`${baseUrl}/register`} style={{ color: '#7a5c2e' }}>
                  Create one
                </Link>{' '}
                with this email and your orders will appear under My Orders.
              </Text>
            ) : null}

            <Button
              href={`${baseUrl}/shop/orders/track`}
              style={{
                display: 'inline-block',
                marginTop: '32px',
                padding: '10px 20px',
                backgroundColor: '#7a5c2e',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Track your order
            </Button>
          </Section>

          <Hr style={{ margin: '0', borderColor: '#eee' }} />
          <Section style={footer}>
            <Text style={{ color: '#999', fontSize: '12px', margin: '0' }}>
              Barometers Realm &middot; Art of Weather Instruments Foundation
              <br />
              If you have any questions, just reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderShippedEmail
