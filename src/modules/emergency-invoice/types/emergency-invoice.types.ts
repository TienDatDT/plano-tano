import { z } from 'zod';

// ──────────────────────────────────────────
// Zod Schemas (Validation)
// ──────────────────────────────────────────

export const createEmergencyInvoiceItemSchema = z.object({
  productName: z.string().min(1, 'Tên sản phẩm không được để trống'),
  quantity: z.number().int().min(1, 'Số lượng phải lớn hơn 0'),
  unitPrice: z.number().positive('Đơn giá phải lớn hơn 0'),
  discountPercent: z
    .number()
    .min(0, 'Chiết khấu không được nhỏ hơn 0%')
    .max(100, 'Chiết khấu không được lớn hơn 100%')
    .default(0),
});



export const createEmergencyInvoiceSchema = z.object({
  invoiceDate: z.string().optional().refine((val) => {
    if (!val) return true; // Optional, so empty is fine
    const selectedDate = new Date(val);
    const now = new Date();
    return selectedDate <= now;
  }, { message: 'Ngày hóa đơn không được lớn hơn thời điểm hiện tại' })
  .transform((val) => (val ? new Date(val).toISOString() : val)),
  note: z.string().optional(),
  items: z
    .array(createEmergencyInvoiceItemSchema)
    .min(1, 'Hóa đơn phải có ít nhất 1 sản phẩm'),
});

export const updateEmergencyInvoiceSchema = createEmergencyInvoiceSchema;

export type CreateEmergencyInvoiceInput = z.infer<typeof createEmergencyInvoiceSchema>;
export type UpdateEmergencyInvoiceInput = z.infer<typeof updateEmergencyInvoiceSchema>;
export type CreateEmergencyInvoiceItemInput = z.infer<typeof createEmergencyInvoiceItemSchema>;

// ──────────────────────────────────────────
// TypeScript Interfaces
// ──────────────────────────────────────────

export interface EmergencyInvoiceItem {
  id: string;
  invoiceId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountPercent: number;
  createdAt: string;
}

export interface EmergencyInvoice {
  id: string;
  invoiceCode: string;
  invoiceDate: string;
  note?: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items?: EmergencyInvoiceItem[];
}

export interface EmergencyInvoiceSummary {
  todayRevenue: number;
  todayCount: number;
  weekRevenue: number;
  monthRevenue: number;
  averageInvoiceValue: number;
  largestInvoiceValue: number;
  filteredRevenue: number;
  filteredCount: number;
  topProducts: { name: string; quantity: number }[];
}

export interface FindManyEmergencyInvoicesOptions {
  page?: number;
  limit?: number;
  period?: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'custom';
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface PaginatedEmergencyInvoices {
  data: EmergencyInvoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}