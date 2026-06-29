'use client';

import { TrendingUp, Receipt, CalendarDays, Calendar } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/formatters';
import type { EmergencyInvoiceSummary } from '../types/emergency-invoice.types';

interface Props {
  summary: EmergencyInvoiceSummary;
  loading?: boolean;
}

const cards = [
  {
    key: 'todayRevenue' as const,
    label: 'Doanh thu hôm nay',
    subLabel: 'Tổng giá trị hóa đơn hôm nay',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    isCurrency: true,
  },
  {
    key: 'todayCount' as const,
    label: 'Hóa đơn hôm nay',
    subLabel: 'Số hóa đơn đã tạo hôm nay',
    icon: Receipt,
    color: 'text-premium-primary',
    bg: 'bg-premium-subtle',
    border: 'border-premium-primary/10',
    isCurrency: false,
  },
  {
    key: 'weekRevenue' as const,
    label: 'Doanh thu tuần này',
    subLabel: 'Từ đầu tuần đến nay',
    icon: CalendarDays,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    isCurrency: true,
  },
  {
    key: 'monthRevenue' as const,
    label: 'Doanh thu tháng này',
    subLabel: 'Từ đầu tháng đến nay',
    icon: Calendar,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    isCurrency: true,
  },
  {
    key: 'averageInvoiceValue' as const,
    label: 'Giá trị trung bình',
    subLabel: 'Trung bình/hóa đơn',
    icon: TrendingUp,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    isCurrency: true,
  },
  {
    key: 'largestInvoiceValue' as const,
    label: 'Hóa đơn lớn nhất',
    subLabel: 'Kỷ lục trong kỳ',
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    isCurrency: true,
  },
  {
    key: 'filteredRevenue' as const,
    label: 'Doanh thu kỳ lọc',
    subLabel: 'Tổng doanh thu theo bộ lọc',
    icon: TrendingUp,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    isCurrency: true,
  },
  {
    key: 'filteredCount' as const,
    label: 'Hóa đơn kỳ lọc',
    subLabel: 'Số hóa đơn theo bộ lọc',
    icon: Receipt,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    isCurrency: false,
  },
];

function SkeletonCard() {
  return (
    <div className="bg-white border border-premium-border rounded-3xl p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-slate-100 rounded w-2/3" />
          <div className="h-7 bg-slate-100 rounded w-1/2 mt-1" />
          <div className="h-2.5 bg-slate-100 rounded w-1/2 mt-1.5" />
        </div>
        <div className="h-12 w-12 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}

export function EmergencyInvoiceSummary({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const value = summary[card.key];
          return (
            <div
              key={card.key}
              className="bg-white border border-premium-border rounded-3xl p-6 flex items-center justify-between shadow-soft hover:shadow-md transition-all duration-200"
            >
              <div>
                <p className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">
                  {card.label}
                </p>
                <h3 className="text-2xl font-black text-neutral-800 mt-1 tracking-tight">
                  {card.isCurrency
                    ? formatCurrency(value as number, 'vi')
                    : (value as number)}
                </h3>
                <p className="text-[10px] text-premium-muted font-semibold mt-1.5">
                  {card.subLabel}
                </p>
              </div>
              <div
                className={`h-12 w-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center border ${card.border} shrink-0 ml-4`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Products Section */}
      {!loading && summary.topProducts && summary.topProducts.length > 0 && (
        <div className="mt-6 px-1">
          <h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-premium-subtle text-premium-primary flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            Top 5 Sản phẩm bán chạy nhất
          </h3>
          <div className="flex flex-wrap gap-2">
            {summary.topProducts.map((p, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 bg-white border border-premium-border rounded-xl shadow-soft text-xs font-semibold text-neutral-700 flex items-center gap-2"
              >
                <span className="max-w-[150px] truncate" title={p.name}>
                  {p.name}
                </span>
                <span className="text-[10px] font-black text-white bg-premium-primary px-1.5 py-0.5 rounded-md">
                  x{p.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
