"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";

interface DailyReport {
  id: string;
  date: Date;
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
}

interface DailyReportTableProps {
  reports: DailyReport[];
}

type SortColumn = "date" | "revenue" | "orders" | "profit";

export function DailyReportTable({
  reports,
}: DailyReportTableProps) {
  const [sortBy, setSortBy] =
    useState<SortColumn>("date");

  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("desc");

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortOrder((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const sortedReports = useMemo(() => {
    const list = [...reports];

    return list.sort((a, b) => {
      const valueMap = {
        date: "date",
        revenue: "totalRevenue",
        orders: "totalOrders",
        profit: "totalProfit",
      } as const;

      const key = valueMap[sortBy];

      const valA = a[key];
      const valB = b[key];

      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(valA).getTime() -
              new Date(valB).getTime()
          : new Date(valB).getTime() -
              new Date(valA).getTime();
      }

      return sortOrder === "asc"
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    });
  }, [reports, sortBy, sortOrder]);

  return (
    <Card
      padding="none"
      className="w-full bg-white border border-premium-border rounded-3xl overflow-hidden shadow-soft transition-all hover:shadow-md"
    >
      <div className="p-6">
        <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wide">
          Daily Performance Aggregations
        </h3>

        <p className="text-xs text-premium-muted mt-1">
          Numerical breakdowns of sales, profit margins,
          and average transaction size
        </p>
      </div>

      <div className="overflow-x-auto border-t border-premium-border">
        <table className="w-full text-left border-collapse text-xs font-semibold text-neutral-700">
          <thead>
            <tr className="bg-slate-50 border-b border-premium-border select-none text-[11px] font-bold text-premium-muted uppercase tracking-wider">
              <th
                className="py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Performance Date</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>

              <th
                className="py-4 px-6 text-right cursor-pointer hover:text-neutral-900 transition-colors"
                onClick={() => handleSort("revenue")}
              >
                <div className="flex items-center gap-1.5 justify-end">
                  <span>Gross Sales</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>

              <th
                className="py-4 px-6 text-center cursor-pointer hover:text-neutral-900 transition-colors"
                onClick={() => handleSort("orders")}
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <span>Transactions</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>

              <th
                className="py-4 px-6 text-right cursor-pointer hover:text-neutral-900 transition-colors"
                onClick={() => handleSort("profit")}
              >
                <div className="flex items-center gap-1.5 justify-end">
                  <span>Net Profit</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>

              <th className="py-4 px-6 text-right">
                Average Order Value (AOV)
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedReports.map((report) => {
              const aov =
                report.totalOrders > 0
                  ? report.totalRevenue /
                    report.totalOrders
                  : 0;

              return (
                <tr
                  key={report.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-4 px-6 font-bold text-neutral-800">
                    {format(
                      new Date(report.date),
                      "MMM dd, yyyy"
                    )}
                  </td>

                  <td className="py-4 px-6 text-right font-black text-neutral-800">
                    $
                    {Number(
                      report.totalRevenue
                    ).toFixed(2)}
                  </td>

                  <td className="py-4 px-6 text-center font-bold text-slate-500">
                    {report.totalOrders}
                  </td>

                  <td className="py-4 px-6 text-right font-extrabold text-emerald-600">
                    $
                    {Number(
                      report.totalProfit
                    ).toFixed(2)}
                  </td>

                  <td className="py-4 px-6 text-right font-black text-premium-primary">
                    ${aov.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-bold text-xs text-neutral-700">
            No breakdowns logged in this date boundary
          </p>
        </div>
      )}
    </Card>
  );
}