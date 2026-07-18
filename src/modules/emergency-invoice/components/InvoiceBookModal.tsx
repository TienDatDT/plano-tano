'use client';

import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
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

// Kích thước THẬT của 1 trang sổ — cố định, không bao giờ đổi.
// LedgerBookPage được thiết kế cứng theo kích thước này (font-size, padding...),
// nên KHÔNG được truyền width/height khác cho HTMLFlipBook, nếu không nội dung
// sẽ bị tràn/cắt do không tự reflow theo kích thước khung.
const PAGE_WIDTH = 420;
const PAGE_HEIGHT = 594;
const MIN_DIFF_TO_UPDATE = 0.01; // ngưỡng đổi scale tối thiểu, tránh set-state vặt

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
  const [scale, setScale] = useState(1);

  const exportPageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bookAreaRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const ledgerPages = useMemo(() => groupInvoicesIntoLedgerPages(invoices), [invoices]);

  const computeScale = useCallback(() => {
    const el = bookAreaRef.current;
    if (!el) return;

    const availableWidth = el.clientWidth;
    const availableHeight = el.clientHeight;
    if (availableWidth <= 0 || availableHeight <= 0) return;

    // Chỉ scale XUỐNG, không bao giờ phóng to quá kích thước gốc (tránh vỡ nét chữ)
    const nextScale = Math.min(
      availableWidth / PAGE_WIDTH,
      availableHeight / PAGE_HEIGHT,
      1
    );

    setScale((prev) => {
      if (Math.abs(prev - nextScale) < MIN_DIFF_TO_UPDATE) return prev;
      return nextScale;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const el = bookAreaRef.current;
    if (!el) return;

    const raf1 = requestAnimationFrame(() => computeScale());

    // An toàn để dùng ResizeObserver ở đây vì bookAreaRef giờ KHÔNG còn bị ảnh
    // hưởng bởi kích thước flipbook bên trong nữa (flipbook luôn cố định
    // PAGE_WIDTH x PAGE_HEIGHT, chỉ scale bằng transform — không đổi layout box
    // theo hướng ảnh hưởng ngược lại cha), nên không còn vòng lặp resize.
    const ro = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(computeScale);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf1);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [isOpen, ledgerPages.length, computeScale]);

  const handleExportPdf = async () => {
    if (!ledgerPages.length) return;
    try {
      setExporting(true);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < ledgerPages.length; i++) {
        const node = exportPageRefs.current[i];
        if (!node) continue;

        // Lưu style gốc để khôi phục lại sau khi chụp xong
        const prevHeight = node.style.height;
        const prevMaxHeight = node.style.maxHeight;
        const prevOverflow = node.style.overflow;

        // Gỡ giới hạn chiều cao/overflow TẠM THỜI để html2canvas chụp được
        // TOÀN BỘ nội dung thật, kể cả khi nó cao hơn khung 594px thiết kế —
        // đây chính là nguyên nhân dòng "Tổng cộng" bị cắt mất trong ảnh bạn gửi.
        node.style.height = 'auto';
        node.style.maxHeight = 'none';
        node.style.overflow = 'visible';

        // Cho DOM 1 nhịp để reflow theo style mới trước khi đo kích thước thật
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const fullWidth = node.scrollWidth;
        const fullHeight = node.scrollHeight;

        const canvas = await html2canvas(node, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: fullWidth,
          height: fullHeight,
          windowHeight: fullHeight, // đảm bảo không bị giới hạn theo viewport ẩn
        });

        // Khôi phục style gốc ngay sau khi chụp xong, tránh ảnh hưởng phần
        // hiển thị khác hoặc lần chụp tiếp theo
        node.style.height = prevHeight;
        node.style.maxHeight = prevMaxHeight;
        node.style.overflow = prevOverflow;

        const imgData = canvas.toDataURL('image/png');

        // Scale kiểu "contain" trong khổ A4 (co theo cả 2 chiều, giữ nguyên tỉ lệ,
        // căn giữa) thay vì chỉ scale theo width như code cũ. Cách cũ giả định
        // canvas luôn đúng tỉ lệ A4 — nếu nội dung cao hơn dự kiến, phần dư sẽ
        // tràn khỏi trang PDF và bị cắt mất khi mở/in, giống lỗi trong ảnh.
        const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
        const renderWidth = canvas.width * ratio;
        const renderHeight = canvas.height * ratio;
        const offsetX = (pageWidth - renderWidth) / 2;
        const offsetY = (pageHeight - renderHeight) / 2;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, renderHeight);
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

      <div className="relative bg-white sm:rounded-3xl shadow-2xl w-full h-[100dvh] sm:h-[90vh] sm:max-w-4xl flex flex-col overflow-hidden">
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

        {/* Book area */}
        <div
          ref={bookAreaRef}
          className="flex-1 min-h-0 overflow-y-scroll flex items-center justify-center bg-premium-bg/30 p-3 sm:p-6 my-5"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-premium-primary" />
          ) : !ledgerPages[0]?.length ? (
            <p className="text-xs font-semibold text-premium-muted">
              Không có hóa đơn nào để hiển thị.
            </p>
          ) : (
            // Wrapper cố định đúng bằng PAGE_WIDTH x PAGE_HEIGHT (kích thước thật
            // của HTMLFlipBook), rồi scale bằng CSS transform để fit khung hiển thị.
            // Cách này giữ nguyên layout nội dung bên trong (không bị cắt/vỡ chữ),
            // chỉ thu nhỏ trực quan toàn bộ cuốn sổ.
            <div
              style={{
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    WebkitFontSmoothing: 'antialiased',
                    textRendering: 'optimizeLegibility',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
            >
              {/* @ts-ignore - react-pageflip types khá lỏng */}
              <HTMLFlipBook
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                size="fixed"
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
            </div>
          )}
        </div>
      </div>

      {/* Container ẩn dùng để xuất PDF — luôn giữ nguyên PAGE_WIDTH/PAGE_HEIGHT gốc */}
      <div
        style={{ position: 'fixed', top: 0, left: '-99999px', zIndex: -1 }}
        aria-hidden="true"
      >
        {ledgerPages.map((rows, index) => (
          <div key={index} style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}>
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