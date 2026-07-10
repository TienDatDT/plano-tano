'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, Printer, Loader2, BookOpen } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import LedgerBookPage from './LedgerBookPage';
import { groupInvoicesIntoLedgerPages } from '../utils/invoice-ledger.utils';
import type { EmergencyInvoice } from '../types/emergency-invoice.types';

const HTMLFlipBook = dynamic(() => import('react-pageflip'), { ssr: false });

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoices: EmergencyInvoice[];
  loading?: boolean;
  businessName?: string;
  address?: string;
  taxCode?: string;
}

// Tỉ lệ gốc của trang sổ: 420 x 594 (~ A4 dọc thu nhỏ)
const BASE_WIDTH = 420;
const BASE_HEIGHT = 594;
const ASPECT_RATIO = BASE_HEIGHT / BASE_WIDTH;

export function InvoiceBookModal({
  isOpen,
  onClose,
  invoices,
  loading = false,
  businessName,
  address,
  taxCode,
}: Props) {
  const [exporting, setExporting] = useState(false);
  const [bookSize, setBookSize] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT });

  // Ref riêng CHỈ dùng cho export — không dính tới flipbook
  const exportPageRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Ref của khung chứa book area để đo kích thước khả dụng
  const bookAreaRef = useRef<HTMLDivElement | null>(null);

  const ledgerPages = useMemo(() => groupInvoicesIntoLedgerPages(invoices), [invoices]);

  // Tự tính lại kích thước flipbook mỗi khi khung chứa đổi kích thước (resize, xoay màn hình, mở modal...)
  useEffect(() => {
    if (!isOpen) return;
    const el = bookAreaRef.current;
    if (!el) return;

    const computeSize = () => {
      const availableWidth = el.clientWidth;
      const availableHeight = el.clientHeight;

      // Giới hạn width theo cả chiều ngang lẫn chiều dọc khả dụng
      let width = Math.min(BASE_WIDTH, availableWidth);
      let height = width * ASPECT_RATIO;

      if (height > availableHeight) {
        height = availableHeight;
        width = height / ASPECT_RATIO;
      }

      setBookSize({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    };

    computeSize();

    const ro = new ResizeObserver(computeSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, ledgerPages.length]);

  const handleExportPdf = async () => {
    if (!ledgerPages.length) return;
    try {
      setExporting(true);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });

      for (let i = 0; i < ledgerPages.length; i++) {
        const node = exportPageRefs.current[i];
        if (!node) continue;

        const canvas = await html2canvas(node, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`so-doanh-thu_${Date.now()}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white sm:rounded-3xl shadow-2xl w-full h-[100dvh] sm:h-auto sm:max-w-4xl sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-5 border-b border-premium-border shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-xl bg-[image:var(--image-gold-gradient)] text-white flex items-center justify-center shadow-gold">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-neutral-900 truncate">
                Sổ doanh thu bán hàng hóa, dịch vụ
              </h2>
              <p className="text-[9px] sm:text-[10px] text-premium-muted font-semibold">
                {invoices.length} hóa đơn · {ledgerPages.length} trang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleExportPdf}
              disabled={!invoices.length || exporting || loading}
              className="h-8 sm:h-9 px-2.5 sm:px-4 flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[image:var(--image-gold-gradient)] text-white text-[11px] sm:text-xs font-black shadow-gold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
              {/* Ẩn chữ trên màn hình rất nhỏ để tiết kiệm diện tích */}
              <span className="hidden xs:inline">
                {exporting ? 'Đang xuất PDF...' : 'In PDF'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Book area — hiển thị cho người dùng xem/lật trang */}
        <div
          ref={bookAreaRef}
          className="flex-1 min-h-0 overflow-auto flex items-center justify-center bg-premium-bg/30 p-3 sm:p-6"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-premium-primary" />
          ) : !ledgerPages[0]?.length ? (
            <p className="text-xs font-semibold text-premium-muted">
              Không có hóa đơn nào để hiển thị.
            </p>
          ) : (
            // @ts-ignore - react-pageflip types khá lỏng
            <HTMLFlipBook
              width={bookSize.width}
              height={bookSize.height}
              showCover={true}
              className="shadow-xl"
            >
              {ledgerPages.map((rows, index) => (
                <LedgerBookPage
                  key={index}
                  rows={rows}
                  businessName={businessName}
                  address={address}
                  taxCode={taxCode}
                />
              ))}
            </HTMLFlipBook>
          )}
        </div>
      </div>

      {/* Container ẩn — chỉ dùng để html2canvas chụp, KHÔNG hiển thị cho user.
          Giữ nguyên kích thước gốc BASE_WIDTH/BASE_HEIGHT để chất lượng PDF xuất ra
          không bị ảnh hưởng bởi việc thu nhỏ hiển thị trên mobile. */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '-99999px',
          zIndex: -1,
        }}
        aria-hidden="true"
      >
        {ledgerPages.map((rows, index) => (
          <div key={index} style={{ width: BASE_WIDTH, height: BASE_HEIGHT }}>
            <LedgerBookPage
              rows={rows}
              businessName={businessName}
              address={address}
              taxCode={taxCode}
              ref={(el) => {
                exportPageRefs.current[index] = el;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}