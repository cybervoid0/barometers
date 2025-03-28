/*
  Warnings:

  - You are about to drop the column `imageId` on the `Manufacturer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Manufacturer" DROP CONSTRAINT "Manufacturer_imageId_fkey";

-- DropIndex
DROP INDEX "Manufacturer_imageId_key";

-- AlterTable
ALTER TABLE "Manufacturer" DROP COLUMN "imageId";

-- CreateTable
CREATE TABLE "_ManufacturerImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ManufacturerImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ManufacturerImages_B_index" ON "_ManufacturerImages"("B");

-- AddForeignKey
ALTER TABLE "_ManufacturerImages" ADD CONSTRAINT "_ManufacturerImages_A_fkey" FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManufacturerImages" ADD CONSTRAINT "_ManufacturerImages_B_fkey" FOREIGN KEY ("B") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
