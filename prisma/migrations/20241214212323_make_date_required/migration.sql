/*
  Warnings:

  - Made the column `date` on table `Barometer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Barometer" ALTER COLUMN "date" SET NOT NULL;
