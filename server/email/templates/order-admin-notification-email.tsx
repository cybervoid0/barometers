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
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import { formatPrice } from '@/utils/currency'

export interface OrderAdminItem {
  name: string
  variantInfo?: Record<string, string> | null
  quantity: number
  priceAtTime: number
}

export interface OrderAdminNotificationEmailProps {
  orderNumber: string
  currency: Currency
  subtotal: number
  shippingCost: number
  total: number
  items: OrderAdminItem[]
  customerName: string
  customerEmail: string
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state?: string | null
    postalCode: string
    country: string
    phone?: string | null
  }
  /** Absolute site origin used to build the admin link. */
  baseUrl: string
  /** Order id, for the admin deep link. */
  orderId: string
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
const muted = { color: '#666', fontSize: '13px', margin: '0' }
const totalLabel = { color: '#666', fontSize: '14px', padding: '4px 0' }
const totalValue = { fontSize: '14px', padding: '4px 0', textAlign: 'right' as const }

export function OrderAdminNotificationEmail({
  orderNumber,
  currency,
  subtotal,
  shippingCost,
  total,
  items,
  customerName,
  customerEmail,
  shippingAddress,
  baseUrl,
  orderId,
}: OrderAdminNotificationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`New order ${orderNumber} — ${formatPrice(total, currency)}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h1" style={{ color: '#ffffff', fontSize: '18px', margin: '0' }}>
              Barometers Realm — Shop
            </Heading>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={{ fontSize: '22px', margin: '0 0 8px' }}>
              New paid order
            </Heading>
            <Text style={{ color: '#444', fontSize: '15px', margin: '0 0 24px' }}>
              Order <strong>{orderNumber}</strong> has been paid.
            </Text>

            <Heading as="h3" style={{ fontSize: '15px', margin: '0 0 8px' }}>
              Customer
            </Heading>
            <Text
              style={{ color: '#444', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.5' }}
            >
              {customerName}
              <br />
              {customerEmail}
              {shippingAddress.phone ? (
                <>
                  <br />
                  {shippingAddress.phone}
                </>
              ) : null}
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
              Ship to
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

            <Button
              href={`${baseUrl}/admin/orders/${orderId}`}
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
              Open in admin
            </Button>
          </Section>

          <Hr style={{ margin: '0', borderColor: '#eee' }} />
          <Section style={{ backgroundColor: '#fafafa', padding: '20px 32px' }}>
            <Text style={{ color: '#999', fontSize: '12px', margin: '0' }}>
              Automated notification from the Barometers Realm shop.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderAdminNotificationEmail
