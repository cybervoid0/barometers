-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "catalogueNumber" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "subject" TEXT,
    "creator" TEXT,
    "date" TIMESTAMP(3),
    "dateDescription" TEXT,
    "placeOfOrigin" TEXT,
    "language" TEXT,
    "physicalDescription" TEXT,
    "annotations" TEXT[],
    "provenance" TEXT,
    "acquisitionDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conditionId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentBarometers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentBarometers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DocumentImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_catalogueNumber_key" ON "Document"("catalogueNumber");

-- CreateIndex
CREATE INDEX "_DocumentBarometers_B_index" ON "_DocumentBarometers"("B");

-- CreateIndex
CREATE INDEX "_DocumentImages_B_index" ON "_DocumentImages"("B");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentBarometers" ADD CONSTRAINT "_DocumentBarometers_A_fkey" FOREIGN KEY ("A") REFERENCES "Barometer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentBarometers" ADD CONSTRAINT "_DocumentBarometers_B_fkey" FOREIGN KEY ("B") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentImages" ADD CONSTRAINT "_DocumentImages_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentImages" ADD CONSTRAINT "_DocumentImages_B_fkey" FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
