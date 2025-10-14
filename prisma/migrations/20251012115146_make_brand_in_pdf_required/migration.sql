/*
  Warnings:

  - Made the column `manufacturerId` on table `PdfFile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."PdfFile" ALTER COLUMN "manufacturerId" SET NOT NULL;
