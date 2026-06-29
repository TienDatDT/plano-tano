/*
  Warnings:

  - You are about to drop the column `costPrice` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `StockInItem` table. All the data in the column will be lost.
  - Added the required column `importPrice` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `importPrice` to the `StockInItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `StockInItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StockInStatus" AS ENUM ('DRAFT', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "StockInItem" DROP CONSTRAINT "StockInItem_batchId_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "costPrice",
ADD COLUMN     "importPrice" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "costPrice" DECIMAL(10,2),
ADD COLUMN     "status" "VariantStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "StockIn" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "receivedAt" TIMESTAMP(3),
ADD COLUMN     "status" "StockInStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "StockInItem" DROP COLUMN "costPrice",
ADD COLUMN     "expDate" TIMESTAMP(3),
ADD COLUMN     "importPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "lotNumber" TEXT,
ADD COLUMN     "mfgDate" TIMESTAMP(3),
ADD COLUMN     "variantId" TEXT NOT NULL,
ALTER COLUMN "batchId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "StockInItem_variantId_idx" ON "StockInItem"("variantId");

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_fromUnitId_fkey" FOREIGN KEY ("fromUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_toUnitId_fkey" FOREIGN KEY ("toUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItem" ADD CONSTRAINT "StockInItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItem" ADD CONSTRAINT "StockInItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
