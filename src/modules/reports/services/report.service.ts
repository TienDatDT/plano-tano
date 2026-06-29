import { prisma } from "@/shared/lib/prisma";
import { OrderStatus } from "@/generated/prisma";
import { startOfDay, endOfDay } from "date-fns";

export class ReportService {
  async generateDailyReport(date: Date) {
    const start = startOfDay(date);
    const end = endOfDay(date);

    // Fetch all completed orders for the day
    const orders = await prisma.order.findMany({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          include: {
            batch: true,
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalOrders = orders.length;

    for (const order of orders) {
      for (const item of order.items) {
        const revenue = Number(item.salePrice) * item.quantity;
        const cost = Number(item.batch.importPrice) * item.quantity;
        
        totalRevenue += revenue;
        totalCost += cost;
      }
    }

    const totalProfit = totalRevenue - totalCost;

    // Upsert the daily report
    return await prisma.dailyReport.upsert({
      where: { date: start },
      update: {
        totalRevenue,
        totalOrders,
        totalProfit,
        updatedAt: new Date(),
      },
      create: {
        date: start,
        totalRevenue,
        totalOrders,
        totalProfit,
      },
    });
  }

  async getReports() {
    return prisma.dailyReport.findMany({
      orderBy: {
        date: "desc",
      },
    });
  }
}

export const reportService = new ReportService();
