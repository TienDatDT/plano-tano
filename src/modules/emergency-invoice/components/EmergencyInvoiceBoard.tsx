'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Loader2, StickyNote, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { emergencyInvoiceApi } from '../api/emergency-invoice.api';
import { EmergencyInvoiceSummary } from './EmergencyInvoiceSummary';
import { EmergencyInvoiceFilters } from './EmergencyInvoiceFilters';
import { EmergencyInvoiceCard } from './EmergencyInvoiceCard';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { EditInvoiceModal } from './EditInvoiceModal';
import { InvoiceDetailDrawer } from './InvoiceDetailDrawer';
import { InvoicePrintTemplate } from './InvoicePrintTemplate';
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut';
import type {
  EmergencyInvoice,
  EmergencyInvoiceSummary as SummaryType,
  CreateEmergencyInvoiceInput,
  UpdateEmergencyInvoiceInput,
} from '../types/emergency-invoice.types';
import { InvoiceBookModal } from './InvoiceBookModal';
type Period = 'today' | 'thisWeek' | 'thisMonth' | 'custom';

export function EmergencyInvoiceBoard() {
  // ── Data state ──────────────────────────────────
  const [invoices, setInvoices] = useState<EmergencyInvoice[]>([]);
  const [summary, setSummary] = useState<SummaryType>({
    todayRevenue: 0,
    todayCount: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    averageInvoiceValue: 0,
    largestInvoiceValue: 0,
    filteredRevenue: 0,
    filteredCount: 0,
    topProducts: [],
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  // ── Loading state ────────────────────────────────
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // ── Filter state ─────────────────────────────────
  const [period, setPeriod] = useState<Period>('today');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [bookOpen, setBookOpen] = useState(false);
  // ── Modal / drawer state ─────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<Partial<CreateEmergencyInvoiceInput> | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<EmergencyInvoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── Print state ──────────────────────────────────
  const [printInvoice, setPrintInvoice] = useState<EmergencyInvoice | null>(null);
  const printContentRef = useRef<HTMLDivElement | null>(null);

  // ── Bulk select state ─────────────────────────────
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useKeyboardShortcut([
    {
      key: 'N',
      shift: true,
      callback: () => {
        () => { setDuplicateSource(null); setIsCreateOpen(true); }
      }
    }
  ])

  const handlePrintAction = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: `Hoa_Don_${printInvoice?.invoiceCode || ''}`,
    onAfterPrint: () => setPrintInvoice(null),
  });

  const handlePrint = (invoice: EmergencyInvoice) => {
    setPrintInvoice(invoice);
  };

  // Chờ template mount xong với invoice mới rồi mới in
  useEffect(() => {
    if (printInvoice && printContentRef.current) {
      handlePrintAction();
    }
  }, [printInvoice]); // eslint-disable-line react-hooks/exhaustive-deps
  // Dùng state lưu ref element để in
  const [printElement, setPrintElement] = useState<HTMLDivElement | null>(null);

  // ── Fetch invoices ────────────────────────────────
  const loadInvoices = useCallback(
    async (targetPage: number = 1) => {
      try {
        setLoadingInvoices(true);
        const res = await emergencyInvoiceApi.getInvoices({
          page: targetPage,
          limit: 20,
          period: period !== 'custom' ? period : undefined,
          fromDate: period === 'custom' ? fromDate || undefined : undefined,
          toDate: period === 'custom' ? toDate || undefined : undefined,
          search: search || undefined,
        });
        if (res.success) {
          setInvoices(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (e: any) {
        toast.error(e.message || 'Không thể tải danh sách hóa đơn');
      } finally {
        setLoadingInvoices(false);
      }
    },
    [period, fromDate, toDate, search],
  );

  // ── Fetch summary ─────────────────────────────────
  const loadSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const res = await emergencyInvoiceApi.getSummary({
        period: period !== 'custom' ? period : undefined,
        fromDate: period === 'custom' ? fromDate || undefined : undefined,
        toDate: period === 'custom' ? toDate || undefined : undefined,
        search: search || undefined,
      });
      if (res.success) setSummary(res.data);
    } catch {
      // non-blocking
    } finally {
      setLoadingSummary(false);
    }
  }, [period, fromDate, toDate, search]);

  useEffect(() => {
    loadInvoices(1);
  }, [loadInvoices]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // api/emergency-invoice.api.ts
  async function getInvoicesByDateRange(
    fromDate: string,
    toDate: string
  ): Promise<EmergencyInvoice[]> {
    const res = await fetch(`/api/emergency-invoices?from=${fromDate}&to=${toDate}`);
    if (!res.ok) throw new Error('Failed to fetch invoices');
    const json = await res.json();
    return json.data; // tùy response shape thực tế của bạn
  }

  // ── Handlers ──────────────────────────────────────
  const handleCreate = async (data: CreateEmergencyInvoiceInput) => {
    await emergencyInvoiceApi.createInvoice(data);
    toast.success('Hóa đơn đã được tạo thành công!');
    setDuplicateSource(null);
    await Promise.all([loadInvoices(1), loadSummary()]);
  };
  const handleDuplicate = (invoice: EmergencyInvoice) => {
    setDuplicateSource({
      note: invoice.note ?? '',
      items: invoice.items?.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? 0, // tuỳ field thực tế trong EmergencyInvoiceItem
        discountPercent: item.discountPercent ?? 0,
      })) ?? [],
    });
    setIsCreateOpen(true);
  };

  const handleEditSubmit = async (id: string, data: UpdateEmergencyInvoiceInput) => {
    await emergencyInvoiceApi.updateInvoice(id, data);
    toast.success('Hóa đơn đã được cập nhật!');
    await Promise.all([loadInvoices(pagination.page), loadSummary()]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa hóa đơn này?')) return;
    try {
      await emergencyInvoiceApi.deleteInvoice(id);
      toast.success('Đã xóa hóa đơn');
      await Promise.all([loadInvoices(pagination.page), loadSummary()]);
    } catch (e: any) {
      toast.error(e.message || 'Không thể xóa hóa đơn');
    }
  };
  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === invoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invoices.map((inv) => inv.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!confirm(`Bạn có chắc muốn xóa ${count} hóa đơn đã chọn? Hành động này không thể hoàn tác.`)) {
      return;
    }

    setIsBulkDeleting(true);
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(
      ids.map((id) => emergencyInvoiceApi.deleteInvoice(id)),
    );

    const failedCount = results.filter((r) => r.status === 'rejected').length;
    const successCount = ids.length - failedCount;

    if (successCount > 0) {
      toast.success(`Đã xóa ${successCount} hóa đơn`);
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} hóa đơn xóa không thành công`);
    }

    setIsBulkDeleting(false);
    setSelectedIds(new Set());
    setSelectMode(false);
    await Promise.all([loadInvoices(pagination.page), loadSummary()]);
  };

  const handleView = (invoice: EmergencyInvoice) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const handleEdit = (invoice: EmergencyInvoice) => {
    setSelectedInvoice(invoice);
    setIsEditOpen(true);
  };

  useKeyboardShortcut([
    {
      key: "n",
      shift: true,
      callback: () => setIsCreateOpen(true)
    }
  ])
  useEffect(() => {
    if (printInvoice && printContentRef.current) {
      // Dùng setTimeout để đảm bảo template đã render xong
      const timer = setTimeout(() => {
        handlePrintAction();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [printInvoice]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResetFilters = () => {
    setPeriod('today');
    setFromDate('');
    setToDate('');
    setSearch('');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadInvoices(newPage);
  };

  // ── Render ────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 sm:gap-8 select-none">
      {/* KPI Summary Cards */}
      <EmergencyInvoiceSummary summary={summary} loading={loadingSummary} />

      {/* Page header + Create button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-[image:var(--image-gold-gradient)] text-white flex items-center justify-center shadow-gold">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-900 tracking-tight">Bảng hóa đơn</h2>
            <p className="text-[10px] text-premium-muted font-semibold">
              {pagination.total} hóa đơn trong khoảng thời gian đã chọn
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectMode}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-black rounded-2xl transition-all active:scale-95 border
      ${selectMode
                ? 'bg-neutral-800 text-white border-neutral-800 hover:opacity-90'
                : 'bg-white text-neutral-700 border-premium-border hover:bg-slate-50'}`}
          >
            {selectMode ? 'Hủy chọn' : 'Chọn nhiều'}
          </button>
          <button onClick={() => setBookOpen(true)}
            className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-[image:var(--image-gold-gradient)] text-white text-xs font-black rounded-2xl shadow-gold hover:opacity-90 transition-all active:scale-95 sm:w-auto"
          >Xem hóa đơn dạng sách</button>
          <button
            id="btn-create-emergency-invoice"
            onClick={() => { setDuplicateSource(null); setIsCreateOpen(true); }}
            className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-[image:var(--image-gold-gradient)] text-white text-xs font-black rounded-2xl shadow-gold hover:opacity-90 transition-all active:scale-95 sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Hóa đơn mới
          </button>

        </div>
      </div>

      {/* Filters */}
      <EmergencyInvoiceFilters
        period={period}
        fromDate={fromDate}
        toDate={toDate}
        search={search}
        onPeriodChange={setPeriod}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onSearchChange={setSearch}
        onReset={handleResetFilters}
      />

      {/* Bulk action bar */}
      {selectMode && (
        <div className="sticky top-2 z-20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-neutral-900 text-white rounded-2xl px-4 sm:px-6 py-3.5 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-xs font-bold text-white/90 hover:text-white transition-colors"
            >
              <span className={`h-4 w-4 rounded-md border-2 flex items-center justify-center
          ${selectedIds.size === invoices.length && invoices.length > 0
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'border-white/40'}`}
              >
                {selectedIds.size === invoices.length && invoices.length > 0 && (
                  <span className="h-1.5 w-1.5 bg-white rounded-sm" />
                )}
              </span>
              Chọn tất cả
            </button>
            <span className="text-xs text-white/60 font-semibold">
              Đã chọn {selectedIds.size} / {invoices.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}
              className="px-4 py-2 text-xs font-bold text-white/80 hover:text-white transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0 || isBulkDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:pointer-events-none text-xs font-black rounded-xl transition-all active:scale-95"
            >
              {isBulkDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Xóa đã chọn
            </button>
          </div>
        </div>
      )}

      {/* Board */}
      {loadingInvoices ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-amber-50 border border-amber-100 rounded-2xl h-48 animate-pulse"
              style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1}deg)` }}
            />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4 bg-white border border-premium-border rounded-3xl shadow-soft px-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-premium-subtle flex items-center justify-center">
            <StickyNote className="w-8 h-8 text-premium-primary opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-neutral-500">Chưa có hóa đơn nào</p>
            <p className="text-xs text-premium-muted mt-1">Nhấn "Hóa đơn mới" để tạo ngay</p>
          </div>
          <button
            onClick={() => { setDuplicateSource(null); setIsCreateOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[image:var(--image-gold-gradient)] text-white text-xs font-black rounded-2xl shadow-gold hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tạo hóa đơn đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {invoices.map((invoice, index) => (
            <EmergencyInvoiceCard
              key={invoice.id}
              invoice={invoice}
              index={index}
              onDelete={handleDelete}
              onView={handleView}
              onEdit={handleEdit}
              onPrint={handlePrint}
              selectMode={selectMode}
              isSelected={selectedIds.has(invoice.id)}
              onToggleSelect={handleToggleSelect}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white border border-premium-border rounded-2xl px-4 sm:px-6 py-4 shadow-soft">
          <p className="text-xs text-premium-muted font-bold">
            Trang{' '}
            <span className="text-neutral-800 font-extrabold">{pagination.page}</span>{' '}
            /{' '}
            <span className="text-neutral-800 font-extrabold">{pagination.totalPages}</span>
            <span className="ml-1 text-[10px] text-premium-muted">
              ({pagination.total} hóa đơn)
            </span>
          </p>
          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-premium-border bg-white text-neutral-500 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-premium-border bg-white text-neutral-500 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => { setDuplicateSource(null); setIsCreateOpen(false); }}
        onSuccess={() => { }}
        onSubmit={handleCreate}
        initialData={duplicateSource}
      />

      {/* Edit Modal */}
      <EditInvoiceModal
        invoice={selectedInvoice}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => { }}
        onSubmit={handleEditSubmit}
      />

      {/* Detail Drawer */}
      <InvoiceDetailDrawer
        invoice={selectedInvoice}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onPrint={handlePrint}
      />

      {/* Hidden Print Template */}
      {/* Container ẩn để html2canvas chụp — KHÔNG dùng display:none */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '-9999px',
          zIndex: -1,
          // Không set height cố định — để nội dung tự co giãn
        }}
        aria-hidden="true"
      >
        {printInvoice && (
          <InvoicePrintTemplate ref={printContentRef} invoice={printInvoice} />
        )}
      </div>


      <InvoiceBookModal
        isOpen={bookOpen}
        onClose={() => setBookOpen(false)}
        invoices={invoices}
        loading={loadingInvoices}
        businessName="Nhà sách Kim Ngân"
        address="242, tỉnh lộ 942, Long Điền, An Giang"
        taxCode="1234567890"
      />
    </div>
  );
}