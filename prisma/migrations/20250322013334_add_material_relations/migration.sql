-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "_BarometerMaterials" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BarometerMaterials_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BarometerMaterials_B_index" ON "_BarometerMaterials"("B");

-- AddForeignKey
ALTER TABLE "_BarometerMaterials" ADD CONSTRAINT "_BarometerMaterials_A_fkey" FOREIGN KEY ("A") REFERENCES "Barometer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BarometerMaterials" ADD CONSTRAINT "_BarometerMaterials_B_fkey" FOREIGN KEY ("B") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;
