/*
  Warnings:

  - You are about to drop the column `issueType` on the `InaccuracyReport` table. All the data in the column will be lost.
  - Added the required column `reporterName` to the `InaccuracyReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InaccuracyReport" DROP COLUMN "issueType",
ADD COLUMN     "reporterName" TEXT NOT NULL;
