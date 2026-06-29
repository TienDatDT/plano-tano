import type { Prisma } from "@/generated/prisma";

export interface DailyReport {
  id: string;
  date: Date;
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
  metrics?: Prisma.JsonValue;
}

export interface DateRange {
  from: Date;
  to: Date;
}
