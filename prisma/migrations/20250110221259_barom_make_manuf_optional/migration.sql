-- DropForeignKey
ALTER TABLE "Barometer" DROP CONSTRAINT "Barometer_manufacturerId_fkey";

-- AlterTable
ALTER TABLE "Barometer" ALTER COLUMN "manufacturerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Barometer" ADD CONSTRAINT "Barometer_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
