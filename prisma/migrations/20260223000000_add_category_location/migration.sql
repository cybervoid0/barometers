-- CreateEnum
CREATE TYPE "CategoryLocation" AS ENUM ('Landing', 'Navigation');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "location" "CategoryLocation"[] DEFAULT ARRAY['Landing','Navigation']::"CategoryLocation"[];

-- Backfill existing categories
UPDATE "Category" SET "location" = ARRAY['Landing','Navigation']::"CategoryLocation"[];
