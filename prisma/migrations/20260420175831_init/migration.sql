/*
  Warnings:

  - You are about to drop the column `stock` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `ShelfItem` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `StockInItem` table. All the data in the column will be lost.
  - Added the required column `batchId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchId` to the `ShelfItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchId` to the `StockInItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShelfItem" DROP CONSTRAINT "ShelfItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "StockInItem" DROP CONSTRAINT "StockInItem_variantId_fkey";

-- DropIndex
DROP INDEX "OrderItem_variantId_idx";

-- DropIndex
DROP INDEX "ShelfItem_variantId_idx";

-- DropIndex
DROP INDEX "StockInItem_variantId_idx";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "batchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "stock";

-- AlterTable
ALTER TABLE "ShelfItem" DROP COLUMN "variantId",
ADD COLUMN     "batchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StockInItem" DROP COLUMN "variantId",
ADD COLUMN     "batchId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "mfgDate" TIMESTAMP(3),
    "expDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Batch_variantId_idx" ON "Batch"("variantId");

-- CreateIndex
CREATE INDEX "Batch_lotNumber_idx" ON "Batch"("lotNumber");

-- CreateIndex
CREATE INDEX "OrderItem_batchId_idx" ON "OrderItem"("batchId");

-- CreateIndex
CREATE INDEX "ShelfItem_batchId_idx" ON "ShelfItem"("batchId");

-- CreateIndex
CREATE INDEX "StockInItem_batchId_idx" ON "StockInItem"("batchId");

-- AddForeignKey
ALTER TABLE "ShelfItem" ADD CONSTRAINT "ShelfItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItem" ADD CONSTRAINT "StockInItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
