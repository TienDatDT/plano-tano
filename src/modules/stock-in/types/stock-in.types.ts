import { StockInStatus } from "@/generated/prisma";

export interface StockInItemInput {
  variantId: string;
  quantity: number;
  importPrice: number;
  lotNumber?: string;
  mfgDate?: Date | string;
  expDate?: Date | string;
}

export interface CreateStockInInput {
  supplierId: string;
  notes?: string;
  receivedAt?: Date | string;
  items: StockInItemInput[];
}

export interface StockInWithItems {
  id: string;
  supplierId: string;
  status: StockInStatus;
  notes: string | null;
  receivedAt: Date | null;
  createdAt: Date;
  items: Array<{
    id: string;
    variantId: string;
    batchId: string | null;
    quantity: number;
    importPrice: any;
    lotNumber: string | null;
    mfgDate: Date | null;
    expDate: Date | null;
  }>;
}
