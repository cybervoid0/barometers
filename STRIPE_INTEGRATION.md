# Stripe Integration Guide

## Overview

This guide explains how to integrate and use Stripe payment system in the Barometers project.

## Database Schema

The following tables were added to support Stripe integration:

### Customer
Links users to Stripe customers.
- `stripeCustomerId` - Stripe customer ID
- `userId` - Reference to User

### Product
Physical products for sale (not collection barometers).
- Prices stored in **cents** (EUR/USD)
- Stock tracking
- Weight in **grams** for shipping calculations
- Stripe product and price IDs

### ProductImage
Product images (separate from collection images).

### ShippingAddress
Delivery addresses for orders.

### Order
Customer orders with status tracking.
- Status: PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
- All amounts in **cents**
- Linked to Stripe session and payment intent

### OrderItem
Individual items in an order (snapshot of price at purchase time).

### Payment
Payment records from Stripe.
- Status: PENDING → SUCCEEDED / FAILED / REFUNDED

## Environment Variables

Add to `.env.local`:

```env
# Stripe Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (see setup below)
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

## Setup

### 1. Install Stripe CLI (for local development)

```bash
brew install stripe/stripe-cli/stripe
```

### 2. Login to Stripe CLI

```bash
stripe login
```

### 3. Start webhook forwarding (in separate terminal)

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

This will output a webhook signing secret like `whsec_...` - add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 4. For production

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the "Signing secret" to your production environment variables

## Usage

### Creating Products (Admin)

```typescript
import { createProduct } from "@/server/stripe/actions";

const result = await createProduct({
  name: "Barometer T-Shirt",
  description: "Cool merchandise",
  priceEUR: 1999, // €19.99 in cents
  priceUSD: 2199, // $21.99 in cents
  stock: 50,
  weight: 200, // grams
  dimensions: {
    length: 30,
    width: 25,
    height: 2
  }
});

if (result.success) {
  console.log("Product created:", result.product);
}
```

### Updating Products

```typescript
import { updateProduct } from "@/server/stripe/actions";

const result = await updateProduct(productId, {
  priceEUR: 1799, // New price in cents
  stock: 45
});
```

### Creating Checkout Session

```typescript
import { createCheckoutSession } from "@/server/stripe/actions";

const result = await createCheckoutSession({
  userId: "user-uuid",
  items: [
    { productId: "product-uuid", quantity: 2 }
  ],
  currency: "EUR",
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "US"
  }
});

if (result.success) {
  // Redirect user to Stripe Checkout
  redirect(result.sessionUrl);
}
```

### Getting User Orders

```typescript
import { getOrdersByUserId } from "@/server/stripe/queries";

const orders = await getOrdersByUserId(userId);
```

### Getting Products

```typescript
import { getProducts, getProductBySlug } from "@/server/stripe/queries";

// All active products
const products = await getProducts();

// Single product by slug
const product = await getProductBySlug("barometer-t-shirt");
```

## Price Utilities

```typescript
import { formatPrice, parsePriceToCents } from "@/utils/currency";

// Display price
formatPrice(1999, "EUR"); // "€19.99"

// Parse user input
parsePriceToCents("19.99"); // 1999
```

## Webhook Flow

1. User clicks "Buy" → `createCheckoutSession()` creates Order (status: PENDING)
2. User pays on Stripe Checkout page
3. Stripe sends webhook → `/api/stripe/webhook`
4. Webhook handler:
   - Updates Order status to PAID
   - Creates Payment record
   - Decrements product stock
5. User redirected to success page

## Order Status Flow

```
PENDING → User created order, not paid yet
PAID → Payment successful
PROCESSING → Admin is preparing order
SHIPPED → Order sent to customer (with tracking number)
DELIVERED → Customer received order
CANCELLED → Order cancelled (payment failed or expired)
REFUNDED → Payment refunded, stock restored
```

## Admin Actions

### Update Order Status

```typescript
import { updateOrderStatus } from "@/server/stripe/queries";

// Mark as shipped
await updateOrderStatus(orderId, "SHIPPED", "TRACK123456");

// Mark as delivered
await updateOrderStatus(orderId, "DELIVERED");
```

### Get All Orders

```typescript
import { getAllOrders } from "@/server/stripe/queries";

// All orders
const allOrders = await getAllOrders();

// Filter by status
const paidOrders = await getAllOrders("PAID");
```

## Testing

### Test Cards

Use these cards in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiry date, any CVC, any postal code.

### Test Webhooks

```bash
# Trigger test webhook
stripe trigger checkout.session.completed
```

## Important Notes

1. **All prices in cents** - Never use floats for money
2. **Stock is decremented** only after successful payment (webhook)
3. **Webhooks are idempotent** - All webhook handlers check if event was already processed before executing
4. **Stripe is source of truth** for payment status
5. **Your DB is source of truth** for inventory and shipping
6. **Transactions in webhooks** - All webhook handlers use Prisma transactions to ensure atomicity (Order update + Payment creation + Stock decrement happen together or not at all)
7. **withPrisma pattern** - All database operations use the `withPrisma` higher-order function for automatic connection management
8. **Partial refunds** - System handles both full and partial refunds. Stock is restored only on full refunds.
9. **Customer creation rollback** - If Stripe customer is created but DB save fails, the Stripe customer is automatically deleted
10. **Stock validation** - Stock is checked in a transaction to minimize race conditions

## Troubleshooting

### Webhook not working locally

Make sure:
1. Stripe CLI is running: `stripe listen --forward-to localhost:3001/api/stripe/webhook`
2. `STRIPE_WEBHOOK_SECRET` is set in `.env.local`
3. Dev server is running on port 3001

### Product creation fails

Check:
1. `STRIPE_SECRET_KEY` is correct
2. Prices are in cents (integers)
3. Product name is unique

### Order stuck in PENDING

- Check webhook logs in Stripe Dashboard
- Verify webhook endpoint is accessible
- Check `/api/stripe/webhook` logs

## Next Steps

1. Create admin UI for product management
2. Create shop page to display products
3. Create cart functionality
4. Create order history page for users
5. Add email notifications (order confirmation, shipping updates)
6. Implement shipping cost calculation based on weight/destination
7. Add tax calculation for different regions

## References

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

