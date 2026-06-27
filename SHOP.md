# The Shop

The merch shop on barometers.info — a Stripe-backed storefront for physical goods
(prints, books, small collectibles) with guest and registered checkout, an admin
back office for products and orders, and transactional email.

This file is the **high-level map**. For the precise mechanics (stock-reservation
invariants, webhook idempotency, rollback patterns) see the deep-dive in
`.docs/SHOP_INTERNALS.md` (local-only) and the focused notes linked at the bottom.

---

## What it is

- A storefront under [`/shop`](app/(pages)/shop) listing active products, each with
  one or more **variants** (size/format/etc.) that carry the price, stock, and weight.
- Checkout is **Stripe Checkout** (Stripe's hosted payment page). We never see card
  data. Payment confirmation comes back asynchronously via a **webhook**.
- Orders, customers, payments, and shipping addresses are persisted locally; Stripe
  is the source of truth for money movement, we are the source of truth for inventory
  and fulfilment.
- An admin area under [`/admin`](app/(pages)/admin) creates/edits products and manages
  orders (status, tracking, refunds).

### Money & currency
The shop sells **exclusively in EUR**. Every monetary value — prices, subtotal,
shipping, tax, totals — is stored as an **integer number of cents**. There is no USD
anywhere anymore (it was removed in a migration).

---

## Tech stack

| Concern | Tool |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, Server Actions |
| Payments | Stripe Checkout (hosted) + webhooks |
| Database | PostgreSQL via Prisma 7 |
| Email | Resend + React Email templates |
| Client state | Zustand (persisted cart + checkout draft) |
| Validation | Zod (every server action validates its input at runtime) |

---

## Customer journey

1. **Browse** — [`/shop`](app/(pages)/shop/page.tsx) lists products; a product page
   [`/shop/[slug]`](app/(pages)/shop/[slug]/page.tsx) shows the gallery, a variant
   selector with live price/stock, and "add to cart".
2. **Cart** — held client-side in a persisted Zustand store (survives reloads and
   navigation). The header shows a cart badge with the item count on every page.
3. **Checkout** — [`/shop/checkout`](app/(pages)/shop/checkout/page.tsx) collects the
   shipping address (the form is also persisted, so navigating away and back doesn't
   lose it). Submitting calls the `createCheckoutSession` server action.
4. **Pay** — the action reserves stock, creates a local `PENDING` order, then redirects
   to the Stripe-hosted payment page.
5. **Confirmation** — on success Stripe redirects to
   [`/shop/checkout/success`](app/(pages)/shop/checkout/success/page.tsx); the cart is
   cleared. The order flips to `PAID` when the **webhook** arrives (not on the redirect —
   the redirect is not trustworthy on its own).
6. **Tracking** — registered users see [`/shop/orders`](app/(pages)/shop/orders/page.tsx);
   guests track via [`/shop/orders/track`](app/(pages)/shop/orders/track/page.tsx) using
   their order number **plus** the email on the order.

### Guest vs registered
Both can check out. A guest order is keyed by email. If that person later registers
(or signs in) with the same email, their past guest orders are linked to the account
on login.

---

## Admin journey

All admin actions are gated to `ADMIN`/`OWNER` roles.

- **Products** — [`/admin/products`](app/(pages)/admin/products/page.tsx) lists **every**
  product (including hidden ones — the only place to find and un-hide them) with a
  status badge and a link to each edit page;
  [`/admin/add-product`](app/(pages)/admin/add-product/page.tsx) and
  [`/admin/edit-product/[id]`](app/(pages)/admin/edit-product/[id]/page.tsx) create and
  edit. Creating or editing a product also creates/updates the matching Stripe Product
  and Prices. Stripe Prices are immutable, so a price change archives the old Price and
  creates a new one. Both create and update use a **rollback pattern**: if the DB write
  fails, the Stripe changes are reversed so the two never drift.
- **Hide / show & delete** — the edit form also has a **Hide from shop / Show in shop**
  toggle (reversible: flips `isActive` and the Stripe Product's `active` flag; a hidden
  product leaves `/shop`, 404s at `/shop/[slug]`, and can't be bought) and a **Delete**
  button behind a confirm dialog. Delete archives the product + its prices on Stripe and
  then either hard-deletes the row (no orders reference it) or **soft-deletes** it
  (`deletedAt` set — when orders reference it, so history survives). Both are admin-gated,
  reverse their Stripe changes if the DB write fails, and revalidate the storefront.
- **Orders** — [`/admin/orders`](app/(pages)/admin/orders/page.tsx) lists orders with a
  status filter; [`/admin/orders/[id]`](app/(pages)/admin/orders/[id]/page.tsx) lets an
  admin advance status, set/correct a tracking number, and issue a **full refund**.
  Refunds go through Stripe; the order flips to `REFUNDED` and stock is restored when
  the `charge.refunded` webhook arrives.

---

## Order lifecycle

```
PENDING ──pay──▶ PAID ──▶ PROCESSING ──▶ SHIPPED ──▶ DELIVERED
   │              │            │
   │              └─ refund ───┴──▶ REFUNDED
   │
   └─ expire / payment fail / rollback / admin cancel ──▶ CANCELLED
```

**CANCELLED is reachable only from PENDING.** Once an order is PAID the money is
captured, so the way to undo it is a **refund** (→ REFUNDED, which restores stock via
the `charge.refunded` webhook) — never a plain cancel that would strand captured funds.
A manual admin cancel of a PENDING order goes through the same guarded release as the
expiry webhook (returns stock, expires the live Stripe session).

Allowed transitions are enforced in code (`VALID_ORDER_TRANSITIONS` in
[`constants/shop.ts`](constants/shop.ts)). `DELIVERED`, `CANCELLED`, and `REFUNDED` are
terminal.

### Stock reservation (the important bit)
Stock lives on the **variant**. It is **reserved at checkout**, not at payment — the
moment a `PENDING` order is created the stock is decremented atomically, so two buyers
can't both grab the last unit. That reservation is released (stock returned) if:

- the buyer never pays and the Stripe session **expires** (default hold shortened to
  **1 hour**),
- the payment **fails**, or
- the order is **refunded**.

A safety-net **cron sweeper** ([`/api/cron/release-stale-orders`](app/api/cron/release-stale-orders/route.ts))
reclaims stock from abandoned `PENDING` orders if the expiry webhook never arrives.
See `.docs/STOCK_SWEEPER.md`.

---

## Shipping & tax

- **Shipping** is computed per order from **total weight × destination zone**
  (domestic / EU / world), not from a fixed table. The formula and its config knobs
  live in [`constants/shop.ts`](constants/shop.ts); the full explanation is in
  `.docs/SHIPPING.md`. The computed amount is passed to Stripe inline per session — we
  deliberately do **not** use Stripe's reusable "Shipping rates" objects, because they
  can't express a weight/zone formula.
- **Tax** is handled by Stripe Tax, but gated behind `STRIPE_TAX_ENABLED`. It is off
  until Stripe Tax is fully configured (active + origin address); turn it on by setting
  that env var to `true`.

---

## Emails

Sent via Resend (React Email templates in [`server/email`](server/email)). If
`RESEND_API_KEY` is unset, sending is a logged no-op — the shop still works.

| Email | Trigger |
| --- | --- |
| Order confirmation (customer) | order becomes `PAID` |
| New-order notification (admin) | order becomes `PAID` |
| Order shipped (customer) | status → `SHIPPED` |
| Tracking updated (customer) | tracking number set/changed on a shipped order |

Each send is idempotent (keyed), so webhook retries don't double-send.

---

## Soft launch

The "Shop" link is currently hidden from the public menu — only `ADMIN`/`OWNER` see it
(`visibleFor: AccessRole.ADMIN` on menu item id 9 in
[`server/menu/queries.ts`](server/menu/queries.ts)). The pages are live and reachable
by URL; this only hides the nav entry while we test on production. **To launch: remove
that `visibleFor`.**

---

## Environment variables

| Var | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe API key (test or live) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the **registered** webhook endpoint. Required at boot. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_TAX_ENABLED` | `"true"` to enable Stripe Tax (default off) |
| `CRON_SECRET` | Bearer token for the stale-order sweep endpoint. Required at boot. |
| `RESEND_API_KEY` | Resend key; absent → emails are a no-op |
| `EMAIL_FROM`, `EMAIL_REPLY_TO` | Sender / reply-to addresses |
| `ORDER_NOTIFICATIONS_EMAIL` | Where admin new-order emails go (comma-separated) |
| `NEXT_PUBLIC_BASE_URL` | Base URL for Stripe success/cancel redirects |

---

## Where the code lives

| Area | Path |
| --- | --- |
| Storefront pages | [`app/(pages)/shop`](app/(pages)/shop) |
| Admin pages | [`app/(pages)/admin`](app/(pages)/admin) (products, orders) |
| Server actions (checkout, products, orders, refunds) | [`app/(pages)/shop/server/actions.ts`](app/(pages)/shop/server/actions.ts) |
| Queries | [`app/(pages)/shop/server/queries.ts`](app/(pages)/shop/server/queries.ts) |
| Webhook handlers | [`app/(pages)/shop/server/webhooks.ts`](app/(pages)/shop/server/webhooks.ts) |
| Webhook route | [`app/api/stripe/webhook/route.ts`](app/api/stripe/webhook/route.ts) |
| Stock release + sweeper | [`app/(pages)/shop/server/order-lifecycle.ts`](app/(pages)/shop/server/order-lifecycle.ts) |
| Cron endpoint | [`app/api/cron/release-stale-orders/route.ts`](app/api/cron/release-stale-orders/route.ts) |
| Cart / checkout stores | [`app/(pages)/shop/stores`](app/(pages)/shop/stores) |
| Shop constants (shipping, TTL, transitions) | [`constants/shop.ts`](constants/shop.ts) |
| Email senders + templates | [`server/email`](server/email) |
| Data model | [`prisma/schema.prisma`](prisma/schema.prisma) |

---

## Related docs

- `.docs/SHOP_INTERNALS.md` — detailed mechanics & invariants (local-only)
- `.docs/SHIPPING.md` — shipping formula in depth
- `.docs/STOCK_SWEEPER.md` — stock reservation & the stale-order cron
- `.docs/DB_DRIFT_FIX.md` — prod schema drift; read before any migration work
