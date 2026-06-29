/*
  Warnings:

  - You are about to drop the column `levels` on the `Shelf` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `ShelfItem` table. All the data in the column will be lost.
  - You are about to drop the column `positionX` on the `ShelfItem` table. All the data in the column will be lost.
  - Added the required column `layoutType` to the `Shelf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cellId` to the `ShelfItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShelfLayoutType" AS ENUM ('DIMENSION', 'GRID');

-- DropIndex
DROP INDEX "ShelfItem_shelfId_level_positionX_key";

-- AlterTable
ALTER TABLE "Shelf" DROP COLUMN "levels",
ADD COLUMN     "columns" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "layoutType" "ShelfLayoutType" NOT NULL,
ADD COLUMN     "rows" INTEGER,
ALTER COLUMN "width" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ShelfItem" DROP COLUMN "level",
DROP COLUMN "positionX",
ADD COLUMN     "cellId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ShelfCell" (
    "id" TEXT NOT NULL,
    "shelfId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,

    CONSTRAINT "ShelfCell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShelfCell_shelfId_idx" ON "ShelfCell"("shelfId");

-- CreateIndex
CREATE UNIQUE INDEX "ShelfCell_shelfId_row_column_key" ON "ShelfCell"("shelfId", "row", "column");

-- CreateIndex
CREATE INDEX "ShelfItem_cellId_idx" ON "ShelfItem"("cellId");

-- AddForeignKey
ALTER TABLE "ShelfItem" ADD CONSTRAINT "ShelfItem_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "ShelfCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfCell" ADD CONSTRAINT "ShelfCell_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "Shelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
