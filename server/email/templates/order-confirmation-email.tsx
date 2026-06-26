import type { Currency } from '@prisma/client'
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import { formatPrice } from '@/utils/currency'

export interface OrderConfirmationItem {
  name: string
  variantInfo?: Record<string, string> | null
  quantity: number
  priceAtTime: number
}

export interface OrderConfirmationEmailProps {
  orderNumber: string
  currency: Currency
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  items: OrderConfirmationItem[]
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
}

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
const totalLabel = { color: '#666', fontSize: '14px', padding: '4px 0' }
const totalValue = { fontSize: '14px', padding: '4px 0', textAlign: 'right' as const }

export function OrderConfirmationEmail({
  orderNumber,
  currency,
  subtotal,
  shippingCost,
  tax,
  total,
  items,
  shippingAddress,
  isGuest,
  baseUrl,
}: OrderConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`Order confirmation — ${orderNumber}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h1" style={{ color: '#ffffff', fontSize: '18px', margin: '0' }}>
              Barometers Realm
            </Heading>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={{ fontSize: '22px', margin: '0 0 8px' }}>
              Thank you for your order!
            </Heading>
            <Text style={{ color: '#444', fontSize: '15px', margin: '0 0 24px' }}>
              We&rsquo;ve received your payment. Your order <strong>{orderNumber}</strong> is
              confirmed.
            </Text>

            {items.map(item => {
              const variant = formatVariantInfo(item.variantInfo)
              return (
                <Row key={`${item.name}-${variant}`} style={{ borderBottom: '1px solid #eee' }}>
                  <Column style={{ padding: '8px 0' }}>
                    <Text style={{ fontWeight: 600, fontSize: '14px', margin: '0' }}>
                      {item.name}
                    </Text>
                    {variant ? <Text style={muted}>{variant}</Text> : null}
                    <Text style={muted}>Qty: {item.quantity}</Text>
                  </Column>
                  <Column
                    style={{
                      padding: '8px 0',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                      fontSize: '14px',
                    }}
                  >
                    {formatPrice(item.priceAtTime * item.quantity, currency)}
                  </Column>
                </Row>
              )
            })}

            <Section style={{ marginTop: '16px' }}>
              <Row>
                <Column style={totalLabel}>Subtotal</Column>
                <Column style={totalValue}>{formatPrice(subtotal, currency)}</Column>
              </Row>
              {shippingCost > 0 ? (
                <Row>
                  <Column style={totalLabel}>Shipping</Column>
                  <Column style={totalValue}>{formatPrice(shippingCost, currency)}</Column>
                </Row>
              ) : null}
              {tax > 0 ? (
                <Row>
                  <Column style={totalLabel}>Tax</Column>
                  <Column style={totalValue}>{formatPrice(tax, currency)}</Column>
                </Row>
              ) : null}
              <Row>
                <Column
                  style={{ padding: '8px 0', borderTop: '2px solid #1a1a1a', fontWeight: 700 }}
                >
                  Total
                </Column>
                <Column
                  style={{
                    padding: '8px 0',
                    borderTop: '2px solid #1a1a1a',
                    textAlign: 'right',
                    fontWeight: 700,
                  }}
                >
                  {formatPrice(total, currency)}
                </Column>
              </Row>
            </Section>

            <Heading as="h3" style={{ fontSize: '15px', margin: '28px 0 8px' }}>
              Shipping address
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
              You can check the status of this order any time at{' '}
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
              href={`${baseUrl}/shop`}
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
              Continue shopping
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

export default OrderConfirmationEmail
