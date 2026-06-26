/*
  Warnings:

  - Added the required column `email` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;
