import { emergencyInvoiceRepository } from '../repositories/emergency-invoice.repository';
import { createEmergencyInvoiceSchema, updateEmergencyInvoiceSchema } from '../types/emergency-invoice.types';
import type {
  CreateEmergencyInvoiceInput,
  UpdateEmergencyInvoiceInput,
  FindManyEmergencyInvoicesOptions,
  PaginatedEmergencyInvoices,
  EmergencyInvoiceSummary,
} from '../types/emergency-invoice.types';
import type { EmergencyInvoiceWithItems } from '../repositories/emergency-invoice.repository';

// ──────────────────────────────────────────
// Invoice Code Generator
// ──────────────────────────────────────────

/**
 * Generate invoice code in format: INV-YYYYMMDD-NNNN
 * Sequence resets daily.
 */
async function generateInvoiceCode(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  const todayCount = await emergencyInvoiceRepository.countToday();
  const sequence = String(todayCount + 1).padStart(4, '0');

  return `INV-${datePart}-${sequence}`;
}

// ──────────────────────────────────────────
// Service
// ──────────────────────────────────────────

export class EmergencyInvoiceService {
  /**
   * Create a new emergency invoice.
   * Validates input, calculates per-item totalPrice and grand total, generates invoice code.
   */
  async createInvoice(raw: unknown): Promise<EmergencyInvoiceWithItems> {
    const data = createEmergencyInvoiceSchema.parse(raw) as CreateEmergencyInvoiceInput;

    // Calculate line totals
    const items = data.items.map((item) => {
      const rawTotal = item.quantity * item.unitPrice;
      const discount = item.discountPercent || 0;
      const totalPrice = rawTotal - (rawTotal * discount) / 100;
      return {
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        discountPercent: discount,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const invoiceCode = await generateInvoiceCode();

    const invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : undefined;

    return await emergencyInvoiceRepository.create({
      invoiceCode,
      invoiceDate,
      note: data.note,
      totalAmount,
      items,
    });
  }

  /**
   * Update an emergency invoice.
   */
  async updateInvoice(id: string, raw: unknown): Promise<EmergencyInvoiceWithItems> {
    const invoice = await emergencyInvoiceRepository.findById(id);
    if (!invoice) {
      throw new Error(`Không tìm thấy hóa đơn với ID: ${id}`);
    }

    const data = updateEmergencyInvoiceSchema.parse(raw) as UpdateEmergencyInvoiceInput;

    const items = data.items.map((item) => {
      const rawTotal = item.quantity * item.unitPrice;
      const discount = item.discountPercent || 0;
      const totalPrice = rawTotal - (rawTotal * discount) / 100;
      return {
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        discountPercent: discount,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : undefined;

    return await emergencyInvoiceRepository.update(id, {
      invoiceDate,
      note: data.note,
      totalAmount,
      items,
    });
  }

  /**
   * Get paginated list of emergency invoices with optional date filters.
   */
  async getInvoices(options: FindManyEmergencyInvoicesOptions): Promise<PaginatedEmergencyInvoices> {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;

    const [data, total] = await Promise.all([
      emergencyInvoiceRepository.findMany({ ...options, page, limit }),
      emergencyInvoiceRepository.count(options),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(serializeInvoice),
      pagination: { total, page, limit, totalPages },
    };
  }

  /**
   * Get single invoice by ID.
   */
  async getInvoiceById(id: string): Promise<EmergencyInvoiceWithItems> {
    const invoice = await emergencyInvoiceRepository.findById(id);
    if (!invoice) {
      throw new Error(`Không tìm thấy hóa đơn với ID: ${id}`);
    }
    return invoice;
  }

  /**
   * Delete an invoice (cascade deletes items).
   */
  async deleteInvoice(id: string): Promise<void> {
    const invoice = await emergencyInvoiceRepository.findById(id);
    if (!invoice) {
      throw new Error(`Không tìm thấy hóa đơn với ID: ${id}`);
    }
    await emergencyInvoiceRepository.delete(id);
  }

   async bulkDeleteInvoices(ids: string[]): Promise<{ deletedCount: number }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Danh sách ID không hợp lệ');
    }

    // Loại bỏ id trùng / rỗng
    const uniqueIds = Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.trim())));
    if (uniqueIds.length === 0) {
      throw new Error('Danh sách ID không hợp lệ');
    }

    const deletedCount = await emergencyInvoiceRepository.deleteMany(uniqueIds);
    return { deletedCount };
  }
  /**
   * Get summary stats (today / this week / this month).
   */
  async getSummary(options: FindManyEmergencyInvoicesOptions = {}): Promise<EmergencyInvoiceSummary> {
    return await emergencyInvoiceRepository.getSummary(options);
  }
}

// ──────────────────────────────────────────
// Serializer: convert Decimal → number for JSON
// ──────────────────────────────────────────

function serializeInvoice(invoice: EmergencyInvoiceWithItems) {
  return {
    ...invoice,
    invoiceDate: invoice.invoiceDate.toISOString(),
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),

    totalAmount: Number(invoice.totalAmount),

    items: invoice.items.map((item: any) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      discountPercent: Number(item.discountPercent || 0),
    })),
  };
}

export const emergencyInvoiceService = new EmergencyInvoiceService();
