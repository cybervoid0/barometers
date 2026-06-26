-- Declare the Order lookup/sweeper indexes that already exist in production as
-- orphan indexes (added manually before they were tracked — see
-- .docs/DB_DRIFT_FIX.md). IF NOT EXISTS makes this a no-op against prod while
-- still creating the indexes on a fresh dev database, keeping schema.prisma and
-- the migration history in sync without re-creating anything.
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
