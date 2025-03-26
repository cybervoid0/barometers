-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "stateId" INTEGER;

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
