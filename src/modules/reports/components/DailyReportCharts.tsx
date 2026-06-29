"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Card } from "@/shared/components/ui/Card";

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

interface DailyReportChartsProps {
  data: ChartData[];
}

export function DailyReportCharts({ data }: DailyReportChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      
      {/* Revenue Chart */}
      <Card className="flex flex-col gap-4 p-6 border border-premium-border rounded-3xl bg-white shadow-soft transition-all hover:shadow-md">
        <div>
          <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wide">{"Revenue Trends"}</h3>
          <p className="text-xs text-premium-muted mt-1">{"Daily consolidated sales curves over the selected interval"}</p>
        </div>
        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Orders Chart */}
      <Card className="flex flex-col gap-4 p-6 border border-premium-border rounded-3xl bg-white shadow-soft transition-all hover:shadow-md">
        <div>
          <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wide">{"Order Volumes"}</h3>
          <p className="text-xs text-premium-muted mt-1">{"Number of transactions processed daily by cash registers"}</p>
        </div>
        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
                formatter={(value) => [value, "Receipts"]}
              />
              <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === data.length - 1 ? "#3b82f6" : "#93c5fd"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
}
