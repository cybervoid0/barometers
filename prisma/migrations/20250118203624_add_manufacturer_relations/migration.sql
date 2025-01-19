/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `Manufacturer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "imageId" TEXT;

-- CreateTable
CREATE TABLE "_ManufacturerSuccessors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ManufacturerSuccessors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ManufacturerSuccessors_B_index" ON "_ManufacturerSuccessors"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_imageId_key" ON "Manufacturer"("imageId");

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManufacturerSuccessors" ADD CONSTRAINT "_ManufacturerSuccessors_A_fkey" FOREIGN KEY ("A") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManufacturerSuccessors" ADD CONSTRAINT "_ManufacturerSuccessors_B_fkey" FOREIGN KEY ("B") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
