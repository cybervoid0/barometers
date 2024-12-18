/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "order" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Image_order_key" ON "Image"("order");
