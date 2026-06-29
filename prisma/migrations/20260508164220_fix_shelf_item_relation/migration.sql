/*
  Warnings:

  - You are about to drop the column `columns` on the `Shelf` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Shelf` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `Shelf` table. All the data in the column will be lost.
  - You are about to drop the column `layoutType` on the `Shelf` table. All the data in the column will be lost.
  - You are about to drop the column `rows` on the `Shelf` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Shelf` table. All the data in the column will be lost.
  - You are about to drop the column `shelfId` on the `ShelfItem` table. All the data in the column will be lost.
  - Added the required column `templateId` to the `Shelf` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShelfItem" DROP CONSTRAINT "ShelfItem_cellId_fkey";

-- DropForeignKey
ALTER TABLE "ShelfItem" DROP CONSTRAINT "ShelfItem_shelfId_fkey";

-- DropIndex
DROP INDEX "ShelfItem_shelfId_idx";

-- AlterTable
ALTER TABLE "Shelf" DROP COLUMN "columns",
DROP COLUMN "description",
DROP COLUMN "height",
DROP COLUMN "layoutType",
DROP COLUMN "rows",
DROP COLUMN "width",
ADD COLUMN     "rotation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "templateId" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ShelfItem" DROP COLUMN "shelfId";

-- CreateTable
CREATE TABLE "ShelfTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layoutType" "ShelfLayoutType" NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "rows" INTEGER,
    "columns" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShelfTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Shelf_templateId_idx" ON "Shelf"("templateId");

-- AddForeignKey
ALTER TABLE "Shelf" ADD CONSTRAINT "Shelf_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ShelfTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfItem" ADD CONSTRAINT "ShelfItem_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "ShelfCell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
