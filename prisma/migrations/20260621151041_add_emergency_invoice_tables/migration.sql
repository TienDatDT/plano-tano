-- CreateTable
CREATE TABLE "emergency_invoices" (
    "id" TEXT NOT NULL,
    "invoiceCode" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emergency_invoices_invoiceCode_key" ON "emergency_invoices"("invoiceCode");

-- CreateIndex
CREATE INDEX "emergency_invoices_invoiceDate_idx" ON "emergency_invoices"("invoiceDate");

-- CreateIndex
CREATE INDEX "emergency_invoices_createdAt_idx" ON "emergency_invoices"("createdAt");

-- CreateIndex
CREATE INDEX "emergency_invoice_items_invoiceId_idx" ON "emergency_invoice_items"("invoiceId");

-- AddForeignKey
ALTER TABLE "emergency_invoice_items" ADD CONSTRAINT "emergency_invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "emergency_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
