-- AlterTable
ALTER TABLE "Barometer" ADD COLUMN     "provenance" TEXT,
ADD COLUMN     "subCategoryId" INTEGER;

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_name_key" ON "SubCategory"("name");

-- AddForeignKey
ALTER TABLE "Barometer" ADD CONSTRAINT "Barometer_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
