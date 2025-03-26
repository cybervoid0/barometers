/*
  Warnings:

  - You are about to drop the column `stateId` on the `Manufacturer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Manufacturer" DROP CONSTRAINT "Manufacturer_stateId_fkey";

-- AlterTable
ALTER TABLE "Manufacturer" DROP COLUMN "stateId";

-- CreateTable
CREATE TABLE "_ManufacturerCountries" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ManufacturerCountries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ManufacturerCountries_B_index" ON "_ManufacturerCountries"("B");

-- AddForeignKey
ALTER TABLE "_ManufacturerCountries" ADD CONSTRAINT "_ManufacturerCountries_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManufacturerCountries" ADD CONSTRAINT "_ManufacturerCountries_B_fkey" FOREIGN KEY ("B") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
