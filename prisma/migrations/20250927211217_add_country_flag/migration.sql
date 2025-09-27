/*
  Warnings:

  - A unique constraint covering the columns `[flag]` on the table `Country` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Country" ADD COLUMN     "flag" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Country_flag_key" ON "public"."Country"("flag");
