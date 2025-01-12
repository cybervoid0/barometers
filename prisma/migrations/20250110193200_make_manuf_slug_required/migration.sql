/*
  Warnings:

  - Made the column `slug` on table `Manufacturer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Manufacturer" ALTER COLUMN "slug" SET NOT NULL;
