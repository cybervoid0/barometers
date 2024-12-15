/*
  Warnings:

  - You are about to drop the column `typeId` on the `Barometer` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Barometer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Barometer" DROP CONSTRAINT "Barometer_typeId_fkey";

-- AlterTable
ALTER TABLE "Barometer" DROP COLUMN "typeId",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Barometer" ADD CONSTRAINT "Barometer_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
