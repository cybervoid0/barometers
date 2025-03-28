-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_imageId_fkey";

-- CreateTable
CREATE TABLE "_CategoryImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryImages_B_index" ON "_CategoryImages"("B");

-- AddForeignKey
ALTER TABLE "_CategoryImages" ADD CONSTRAINT "_CategoryImages_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryImages" ADD CONSTRAINT "_CategoryImages_B_fkey" FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
