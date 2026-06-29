import { prisma } from "@/shared/lib/prisma";
import { CreateStockInInput } from "../types/stock-in.types";
import { StockInStatus } from "@/generated/prisma";

export class StockInRepository {
  async create(data: CreateStockInInput) {
    return prisma.stockIn.create({
      data: {
        supplierId: data.supplierId,
        notes: data.notes,
        receivedAt: data.receivedAt ? new Date(data.receivedAt) : null,
        status: StockInStatus.DRAFT,
        items: {
          create: data.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            importPrice: item.importPrice,
            lotNumber: item.lotNumber,
            mfgDate: item.mfgDate ? new Date(item.mfgDate) : null,
            expDate: item.expDate ? new Date(item.expDate) : null,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.stockIn.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
        supplier: true,
      },
    });
  }

  async findAll() {
    return prisma.stockIn.findMany({
      include: {
        supplier: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateStatus(id: string, status: StockInStatus, tx?: any) {
    const client = tx || prisma;
    return client.stockIn.update({
      where: { id },
      data: { status },
    });
  }
}

export const stockInRepository = new StockInRepository();
