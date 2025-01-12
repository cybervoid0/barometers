/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Manufacturer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Manufacturer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_slug_key" ON "Manufacturer"("slug");
