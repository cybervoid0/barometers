-- The shop now sells exclusively in EUR. Drop the USD price columns and remove
-- the USD value from the Currency enum. All existing rows are already EUR, so
-- the enum recast cannot fail.

-- Drop USD price columns from ProductVariant.
-- The unique index on "stripePriceIdUSD" is dropped automatically with the column.
ALTER TABLE "ProductVariant" DROP COLUMN "priceUSD";
ALTER TABLE "ProductVariant" DROP COLUMN "stripePriceIdUSD";

-- Shrink the Currency enum to EUR only (Postgres requires recreating the type).
BEGIN;
CREATE TYPE "Currency_new" AS ENUM ('EUR');
ALTER TABLE "Order" ALTER COLUMN "currency" TYPE "Currency_new" USING ("currency"::text::"Currency_new");
ALTER TABLE "OrderItem" ALTER COLUMN "currency" TYPE "Currency_new" USING ("currency"::text::"Currency_new");
ALTER TABLE "Payment" ALTER COLUMN "currency" TYPE "Currency_new" USING ("currency"::text::"Currency_new");
ALTER TYPE "Currency" RENAME TO "Currency_old";
ALTER TYPE "Currency_new" RENAME TO "Currency";
DROP TYPE "Currency_old";
COMMIT;
