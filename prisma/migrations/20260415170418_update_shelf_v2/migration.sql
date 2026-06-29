/*
  Warnings:

  - You are about to drop the column `height` on the `Shelf` table. All the data in the column will be lost.
  - You are about to drop the column `positionY` on the `ShelfItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shelfId,level,positionX]` on the table `ShelfItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `levels` to the `Shelf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `ShelfItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shelf" DROP COLUMN "height",
ADD COLUMN     "levels" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ShelfItem" DROP COLUMN "positionY",
ADD COLUMN     "level" INTEGER NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "ShelfItem_shelfId_level_positionX_key" ON "ShelfItem"("shelfId", "level", "positionX");
