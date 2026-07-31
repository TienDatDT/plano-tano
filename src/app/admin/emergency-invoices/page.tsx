import type { Metadata } from 'next';
import { EmergencyInvoiceBoard } from '@/modules/emergency-invoice/components/EmergencyInvoiceBoard';
import { PinnedNotesSection } from '@/modules/pinned-note/components/PinnedNotesSection';

export const metadata: Metadata = {
  title: 'Hóa đơn nhanh | TanaPlano',
  description: 'Tạo và quản lý hóa đơn nhanh trong giai đoạn vận hành.',
};

export default function EmergencyInvoicesPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Hóa đơn nhanh</h1>
        <p className="mt-2 text-sm text-premium-muted">
          Tạo hóa đơn thủ công không phụ thuộc vào hệ thống sản phẩm.
        </p>
      </div>

      <PinnedNotesSection />
      
      <EmergencyInvoiceBoard />
    </div>
  );
}
