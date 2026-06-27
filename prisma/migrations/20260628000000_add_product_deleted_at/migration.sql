-- Add a soft-delete marker to Product. Hidden products keep deletedAt NULL
-- (isActive=false, reversible); deleted products set deletedAt (and isActive=false)
-- so they're excluded everywhere — including the admin list — while order history
-- that references them is preserved (OrderItem.product is Restrict, not Cascade).
--
-- IF NOT EXISTS keeps this idempotent against the production DB, which diverges
-- from migration history (see .docs/DB_DRIFT_FIX.md): the column is created on a
-- fresh dev DB and is a no-op anywhere it already exists.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
