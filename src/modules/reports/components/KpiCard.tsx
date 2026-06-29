import React from "react";
import { Card } from "@/shared/components/ui/Card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: KpiCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-6 transition-all duration-300 hover:shadow-card hover:scale-[1.01]">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-premium-subtle text-premium-primary">
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              trend.isUp
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trend.isUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}%
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-premium-muted">{title}</h3>
        <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
          {value}
        </p>
        {description && (
          <p className="mt-1 text-xs text-premium-muted/70">{description}</p>
        )}
      </div>
    </Card>
  );
}
