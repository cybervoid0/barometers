-- CreateEnum
CREATE TYPE "InaccuracyReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');

-- CreateTable
CREATE TABLE "InaccuracyReport" (
    "id" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "barometerId" TEXT NOT NULL,
    "reporterEmail" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "InaccuracyReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InaccuracyReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InaccuracyReport" ADD CONSTRAINT "InaccuracyReport_barometerId_fkey" FOREIGN KEY ("barometerId") REFERENCES "Barometer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
