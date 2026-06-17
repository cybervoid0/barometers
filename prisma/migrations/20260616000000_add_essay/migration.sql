-- CreateEnum
CREATE TYPE "EssayTopic" AS ENUM ('Instruments', 'Materials', 'Conservation', 'Collecting');

-- CreateTable
CREATE TABLE "Essay" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "standfirst" TEXT NOT NULL,
    "topic" "EssayTopic" NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "pdfName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Essay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Essay_date_idx" ON "Essay"("date");
