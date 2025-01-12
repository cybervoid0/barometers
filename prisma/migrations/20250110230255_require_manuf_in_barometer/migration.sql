/*
  Warnings:

  - Made the column `manufacturerId` on table `Barometer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Barometer" DROP CONSTRAINT "Barometer_manufacturerId_fkey";

-- AlterTable
ALTER TABLE "Barometer" ALTER COLUMN "manufacturerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Barometer" ADD CONSTRAINT "Barometer_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
