'use client';

import React from 'react';
import { formatCurrency } from '@/shared/lib/formatters';
import type { LedgerRow } from '../utils/invoice-ledger.utils';

interface LedgerBookPageProps {
  rows: LedgerRow[];
  businessName?: string;
  address?: string;
  taxCode?: string;
  period?: string; // Kỳ kê khai, vd: "Tháng 07/2025"
}

const LedgerBookPage = React.forwardRef<HTMLDivElement, LedgerBookPageProps>(
  ({ rows, businessName = '', address = '', taxCode = '', period = '' }, ref) => {
    const total = rows.reduce((sum, r) => sum + r.amount, 0);
    const pageDate = rows[0]?.date ?? '';

    return (
      <div
        ref={ref}
        className="page bg-white w-full h-full p-6 flex flex-col border border-premium-border text-[10px]"
      >
        {/* Header thông tin hộ kinh doanh */}
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1.5 flex-1 pr-4">
            <p className="font-bold">
              HỘ KINH DOANH
              <span className="border-b border-dotted border-neutral-400 ml-1 inline-block w-40 align-bottom">
                {businessName}
              </span>
            </p>
            <p className="font-bold">
              Địa chỉ:
              <span className="border-b border-dotted border-neutral-400 ml-1 inline-block w-48 align-bottom">
                {address}
              </span>
            </p>
            <p className="font-bold">
              Mã số thuế:
              <span className="border-b border-dotted border-neutral-400 ml-1 inline-block w-40 align-bottom">
                {taxCode}
              </span>
            </p>
          </div>
          <div className="text-right text-[9px] italic leading-tight">
            <p className="font-bold not-italic">Mẫu số S1a-HKD</p>
            <p>(Kèm theo Thông tư số</p>
            <p>152/2025/TT-BTC ngày 31 tháng 12</p>
            <p>năm 2025 của Bộ trưởng Bộ Tài chính)</p>
          </div>
        </div>

        {/* Tiêu đề */}
        <div className="text-center mb-3">
          <h3 className="text-sm font-black uppercase">
            Sổ doanh thu bán hàng hóa, dịch vụ
          </h3>
          <p className="text-[10px] mt-1">
            Địa điểm kinh doanh:
            <span className="border-b border-dotted border-neutral-400 ml-1 inline-block w-64" />
          </p>
          <p className="text-[10px]">
            Kỳ kê khai:
            <span className="border-b border-dotted border-neutral-400 ml-1 inline-block w-40">
              {period}
            </span>
          </p>
        </div>

        {/* Bảng dữ liệu */}
        <div className="flex-1 border border-neutral-800">
          {/* Header bảng */}
          <div className="grid grid-cols-12 border-b border-neutral-800 font-bold text-center">
            <div className="col-span-2 border-r border-neutral-800 py-1">Ngày tháng</div>
            <div className="col-span-6 border-r border-neutral-800 py-1">Diễn giải</div>
            <div className="col-span-4 py-1">Số tiền</div>
          </div>
          <div className="grid grid-cols-12 border-b border-neutral-800 text-center italic">
            <div className="col-span-2 border-r border-neutral-800 py-0.5">A</div>
            <div className="col-span-6 border-r border-neutral-800 py-0.5">B</div>
            <div className="col-span-4 py-0.5">1</div>
          </div>

          {/* Dòng dữ liệu */}
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 border-b border-neutral-300 min-h-[22px]"
            >
              <div className="col-span-2 border-r border-neutral-300 px-1.5 py-1 text-center">
                {idx === 0 ? row.date : ''}
              </div>
              <div className="col-span-6 border-r border-neutral-300 px-1.5 py-1 truncate">
                {row.description}
              </div>
              <div className="col-span-4 px-1.5 py-1 text-right font-semibold">
                {formatCurrency(row.amount, 'vi')}
              </div>
            </div>
          ))}

          {/* Dòng trống lấp đầy cho giống sổ thật (tuỳ chọn) */}
          {Array.from({ length: Math.max(0, 15 - rows.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="grid grid-cols-12 border-b border-neutral-300 min-h-[22px]">
              <div className="col-span-2 border-r border-neutral-300" />
              <div className="col-span-6 border-r border-neutral-300" />
              <div className="col-span-4" />
            </div>
          ))}

          {/* Tổng cộng */}
          <div className="grid grid-cols-12 border-t border-neutral-800 font-black">
            <div className="col-span-2 border-r border-neutral-800 py-1" />
            <div className="col-span-6 border-r border-neutral-800 py-1 text-center">
              Tổng cộng
            </div>
            <div className="col-span-4 py-1 text-right pr-1.5">
              {formatCurrency(total, 'vi')}
            </div>
          </div>
        </div>

        {/* Footer ký tên */}
        <div className="text-center mt-3 text-[10px]">
          <p>
            Ngày <span className="inline-block w-6 border-b border-dotted border-neutral-400" /> tháng{' '}
            <span className="inline-block w-6 border-b border-dotted border-neutral-400" /> năm{' '}
            <span className="inline-block w-10 border-b border-dotted border-neutral-400" />
          </p>
          <p className="font-black uppercase mt-1">
            Người đại diện hộ kinh doanh/ cá nhân kinh doanh
          </p>
          <p className="italic">(Ký, ghi rõ họ tên, đóng dấu (nếu có))</p>
        </div>
      </div>
    );
  }
);

LedgerBookPage.displayName = 'LedgerBookPage';
export default LedgerBookPage;