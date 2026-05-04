# Database Drift Fix — Technical Task

## TL;DR

Production database schema and `_prisma_migrations` table diverge from what any branch's migration files describe. `prisma migrate dev` is effectively broken on any branch that does not already carry the hidden changes. This document explains the current mess and lays out a plan to bring the migration history, `schema.prisma`, and the actual production schema back into sync.

This is **infrastructure debt**, not a feature. Schedule it as a dedicated task with a dedicated PR.

---

## Symptoms

Running `bunx prisma migrate dev` on the `master` branch (or any branch based on it, e.g. `new-menu-items`) after `bun run import-data` produces a drift report like:

```
- Drift detected: Your database schema is not in sync with your migration history.

[+] Added enums: Currency, OrderStatus, PaymentStatus
[+] Added tables: Customer, Order, OrderItem, Payment, Product,
                  ProductImage, ProductOption, ProductVariant, ShippingAddress

[*] Changed the `Barometer` table
  [+] Added index on columns (categoryId, conditionId, date, manufacturerId, subCategoryId)

[*] Changed the `Document` table
  [+] Added index on columns (conditionId, date)

[*] Changed the `InaccuracyReport` table
  [+] Added index on columns (barometerId, status)

[*] Changed the `PdfFile` table
  [+] Added index on columns (manufacturerId)

[*] Stripe tables — extra non-unique indexes on Order, OrderItem, Payment,
    ProductImage, ProductOption, ProductVariant, Customer

- Migrations applied to the database but absent from the migrations directory:
    20251018032256_add_stripe_tables
    20251031174439_rename_product_image_alt_to_name
```

Workaround currently in use: `prisma migrate deploy` (which does not check drift) is used to apply new migrations. This works but is a leaky abstraction — any future `migrate dev` will keep complaining.

---

## Root Cause Analysis

Three independent sources of divergence:

### 1. Stripe migrations applied to prod without merging the code

The `stripe` branch contains four migrations:

- `20251018032256_add_stripe_tables`
- `20251031174439_rename_product_image_alt_to_name`
- `20260224213119_add_product_variants`
- `20260224221204_make_customer_user_optional`

Only the first two are recorded in production's `_prisma_migrations`. The Stripe branch has never been merged into `master`, so these files do not exist on `master`. Yet the tables they create (`Customer`, `Order`, `OrderItem`, `Payment`, `Product`, `ProductImage`, `ShippingAddress`) are present in production.

**Additionally**, tables `ProductVariant` and `ProductOption` — created by the third Stripe migration (`20260224213119_add_product_variants`) — are **also present in production**, but the migration itself is **not** recorded in `_prisma_migrations`. Somebody created those tables bypassing Prisma (either raw SQL, `prisma db push`, or manually applying the migration without inserting into `_prisma_migrations`).

### 2. Orphan indexes with no origin

Indexes exist in production that are not created by any migration in any branch:

- `Barometer_categoryId_idx`, `Barometer_conditionId_idx`, `Barometer_date_idx`, `Barometer_manufacturerId_idx`, `Barometer_subCategoryId_idx`
- `Document_conditionId_idx`, `Document_date_idx`
- `InaccuracyReport_barometerId_idx`, `InaccuracyReport_status_idx`
- `PdfFile_manufacturerId_idx`
- Several non-unique indexes on Stripe tables (e.g. `Order_customerId_idx`, `Order_status_idx`, `Order_createdAt_idx`, `OrderItem_orderId_idx`, `OrderItem_productId_idx`, `OrderItem_variantId_idx`, `Payment_orderId_idx`, `Payment_status_idx`, `ProductImage_productId_idx`, `ProductImage_variantId_idx`, `ProductOption_productId_idx`, `ProductVariant_productId_idx`, `ProductVariant_sku_idx`, `Customer_userId_idx`)

Grep the entire repository (including `stripe` branch) for `CREATE INDEX` or `@@index` — none of these will appear. They were added manually, probably during perf tuning.

### 3. `schema.prisma` on `master` does not describe Stripe models

Even if the Stripe migration files were copied into `master`, `schema.prisma` on `master` contains no `Customer`, `Order`, `Product`, etc. models. `prisma generate` would produce a client without them — which is fine for non-shop code, but it means `migrate dev` (which compares schema → DB) would want to drop them.

---

## Fix Plan

The goal: make `master` a truthful representation of what is actually in production, without pulling in Stripe application code (which isn't live).

### Step 1 — Pull Stripe migration files into `master`

Copy from `stripe` branch into `master`:

```
prisma/migrations/20251018032256_add_stripe_tables/migration.sql
prisma/migrations/20251031174439_rename_product_image_alt_to_name/migration.sql
```

These are exactly the migrations already recorded in `_prisma_migrations` on prod, so no re-application happens on deploy.

### Step 2 — Add Stripe models to `schema.prisma`

Port the `Customer`, `Product`, `ProductImage`, `Order`, `OrderItem`, `ShippingAddress`, `Payment` models and the `OrderStatus`, `PaymentStatus`, `Currency` enums from `stripe` branch (state at commit `2944172 feat: product images`, after the second migration but before `add_product_variants`).

Also add the reverse relation `Customer Customer?` on `User`.

Reference diff:

```bash
git diff master...2944172 -- prisma/schema.prisma
```

### Step 3 — Baseline migration for `ProductVariant`, `ProductOption`, and orphan indexes

Create one new migration (e.g. `<today>_baseline_production_state`) that brings the file-level history in line with reality:

- `CREATE TABLE IF NOT EXISTS "ProductVariant" (...)` — copy structure from prod via `pg_dump --schema-only -t 'ProductVariant'` on the remote.
- `CREATE TABLE IF NOT EXISTS "ProductOption" (...)` — same.
- All foreign keys added via `DO $$ BEGIN ... ALTER TABLE ... ADD CONSTRAINT ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;` idempotency blocks.
- `CREATE INDEX IF NOT EXISTS "Barometer_categoryId_idx" ON "Barometer"("categoryId");` for all orphan indexes.

**Critical:** every DDL statement must be idempotent (`IF NOT EXISTS`, `IF EXISTS`, or guarded with `pg_catalog` lookups). The migration must succeed on:

- Prod DB (where everything already exists) → applies cleanly, writes row into `_prisma_migrations`, creates nothing.
- Fresh dev DB (created via `migrate reset` or `createdb` + `migrate deploy`) → creates everything from scratch.

Verify by dumping prod schema after the merge and diffing against `bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`. They must be identical.

### Step 4 — Add matching `@@index` / `@@unique` directives to `schema.prisma`

For every orphan index added in step 3, add the corresponding Prisma-level directive, e.g.:

```prisma
model Barometer {
  // ...
  @@index([categoryId])
  @@index([conditionId])
  @@index([date])
  @@index([manufacturerId])
  @@index([subCategoryId])
}
```

This ensures `prisma migrate dev` in the future sees no drift.

### Step 5 — Verify

On a local DB that is a fresh copy of prod (via `bun run import-data`):

```bash
bunx dotenv -e .env.local prisma migrate deploy
# Should say "No pending migrations" or only apply the new baseline migration.

bunx dotenv -e .env.local prisma migrate dev --create-only
# Should say "Already in sync, no schema change or pending migration was found."
```

If both pass — the fix is correct.

### Step 6 — Deploy

```bash
bun run migrate:remote
```

The baseline migration runs on prod as a no-op (thanks to `IF NOT EXISTS`), but the `_prisma_migrations` table now contains a record of it. From this point forward, `migrate dev` works from any branch, and the history is internally consistent.

### Step 7 — Merge / rebase `stripe` branch on top

Once `master` reflects prod reality, the `stripe` branch needs to be rebased onto the new `master`. Its migrations `20260224213119_add_product_variants` and `20260224221204_make_customer_user_optional` should be **rewritten** — because `ProductVariant`/`ProductOption` are already in master now. Either:

- Delete those two migration folders from `stripe` and rely on the baseline migration from step 3, **or**
- Keep them as no-ops (idempotent guards), purely for historical traceability.

Decide based on whether anyone has a dev DB that already recorded those migration names.

---

## Non-goals

- **Do not** bring Stripe application code (routes, pages, webhooks, React components) into `master`. Only database schema and migrations. The shop feature itself continues to live on the `stripe` branch until it is ready to ship.
- **Do not** drop or alter any existing prod data. This is a metadata reconciliation, not a data migration.

---

## Prevention

Going forward:

1. **Prisma only.** No `db push` on prod. No ad hoc `CREATE INDEX` via `psql`. Every schema change goes through a migration file that is committed to `master` before being applied to prod.
2. **Deployment order.** Never `prisma migrate deploy` from a feature branch against prod unless that branch is about to be merged. Applying migrations from a branch that may be abandoned creates exactly this mess.
3. **Shadow DB.** Ensure `prisma.config.ts` (or `.env.local`) has a `shadowDatabaseUrl` configured so `migrate dev` catches drift early during local development.
4. **CI check.** Add a GitHub Action that runs `prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma --exit-code` on every PR. Breaks the build if migrations and schema disagree.

---

## Historical Context

This debt accumulated because:

- The `stripe` feature was partially rolled out to prod (DB-level) ahead of its code release.
- Someone performed manual DB operations to add performance indexes.
- The `stripe` branch was never merged, so its migration files never reached `master`.

The current state is not anyone's single mistake — it is the natural outcome of treating `prisma migrate deploy` as a quick fix. The cleanup here is the cost of skipping the paper trail.
