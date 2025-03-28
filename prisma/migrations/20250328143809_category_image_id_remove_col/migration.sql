/*
  Warnings:

  - You are about to drop the column `imageId` on the `Category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Category_imageId_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "imageId";
