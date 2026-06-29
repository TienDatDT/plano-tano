'use client';

import { Calendar, Filter, RotateCcw } from 'lucide-react';
import type { FindManyEmergencyInvoicesOptions } from '../types/emergency-invoice.types';

type Period = 'today' | 'thisWeek' | 'thisMonth' | 'custom';

interface Props {
  period: Period;
  fromDate: string;
  toDate: string;
  search: string;
  onPeriodChange: (period: Period) => void;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'thisWeek', label: 'Tuần này' },
  { value: 'thisMonth', label: 'Tháng này' },
  { value: 'custom', label: 'Tuỳ chọn' },
];

export function EmergencyInvoiceFilters({
  period,
  fromDate,
  toDate,
  search,
  onPeriodChange,
  onFromDateChange,
  onToDateChange,
  onSearchChange,
  onReset,
}: Props) {
  return (
    <div className="bg-white border border-premium-border rounded-3xl p-5 shadow-soft flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
      {/* Period pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onPeriodChange(opt.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              period === opt.value
                ? 'bg-premium-primary text-white shadow-sm'
                : 'bg-premium-subtle text-premium-muted hover:bg-premium-accent hover:text-neutral-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {period === 'custom' && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-premium-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="pl-8 pr-3 h-9 border border-premium-border rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-premium-primary bg-white"
            />
          </div>
          <span className="text-xs text-premium-muted font-semibold">đến</span>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-premium-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="pl-8 pr-3 h-9 border border-premium-border rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-premium-primary bg-white"
            />
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo mã HĐ hoặc Tên SP..."
            className="w-full sm:w-64 h-9 pl-9 pr-3 border border-premium-border rounded-xl text-xs font-semibold text-neutral-800 placeholder-premium-muted focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all"
          />
          <Filter className="w-3.5 h-3.5 text-premium-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Reset */}
        {(period !== 'today' || fromDate || toDate || search) && (
          <button
            onClick={onReset}
            className="h-9 px-3 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-all text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
