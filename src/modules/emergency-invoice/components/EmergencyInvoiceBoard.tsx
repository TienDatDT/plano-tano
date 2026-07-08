'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Loader2, StickyNote, ChevronLeft, ChevronRight } from 'lucide-react';
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
import type {
  EmergencyInvoice,
  EmergencyInvoiceSummary as SummaryType,
  CreateEmergencyInvoiceInput,
  UpdateEmergencyInvoiceInput,
} from '../types/emergency-invoice.types';
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut';

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

  // ── Modal / drawer state ─────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<EmergencyInvoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── Print state ──────────────────────────────────
  const [printInvoice, setPrintInvoice] = useState<EmergencyInvoice | null>(null);
  const printContentRef = useRef<HTMLDivElement | null>(null);

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

  // ── Handlers ──────────────────────────────────────
  const handleCreate = async (data: CreateEmergencyInvoiceInput) => {
    await emergencyInvoiceApi.createInvoice(data);
    toast.success('Hóa đơn đã được tạo thành công!');
    await Promise.all([loadInvoices(1), loadSummary()]);
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
      key:"n",
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
        <button
          id="btn-create-emergency-invoice"
          onClick={() => setIsCreateOpen(true)}
          className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-[image:var(--image-gold-gradient)] text-white text-xs font-black rounded-2xl shadow-gold hover:opacity-90 transition-all active:scale-95 sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Hóa đơn mới
        </button>
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
            onClick={() => setIsCreateOpen(true)}
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
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => { }}
        onSubmit={handleCreate}
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
      <div className="hidden print:block">
        {printInvoice && (
          <InvoicePrintTemplate ref={printContentRef} invoice={printInvoice} />
        )}
      </div>
    </div>
  );
}