/*
  Warnings:

  - You are about to drop the column `layout` on the `Shelf` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `ShelfItem` table. All the data in the column will be lost.
  - Added the required column `height` to the `Shelf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `layoutId` to the `Shelf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posX` to the `Shelf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posY` to the `Shelf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Shelf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionX` to the `ShelfItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionY` to the `ShelfItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shelf" DROP COLUMN "layout",
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "layoutId" TEXT NOT NULL,
ADD COLUMN     "posX" INTEGER NOT NULL,
ADD COLUMN     "posY" INTEGER NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ShelfItem" DROP COLUMN "position",
ADD COLUMN     "positionX" INTEGER NOT NULL,
ADD COLUMN     "positionY" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "StoreLayout" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreLayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Shelf_layoutId_idx" ON "Shelf"("layoutId");

-- AddForeignKey
ALTER TABLE "Shelf" ADD CONSTRAINT "Shelf_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "StoreLayout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
