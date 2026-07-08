import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-premium-bg px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/20">
        <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" strokeWidth={2} />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
        Truy cập bị từ chối
      </h1>
      <p className="mt-3 max-w-sm text-sm text-premium-muted">
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là một sự nhầm lẫn.
      </p>
      <Link
        href="/admin/dashboard"
        className="mt-8 rounded-xl bg-premium-primary px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-gold)] transition-opacity hover:opacity-90"
      >
        Quay lại Bảng điều khiển
      </Link>
    </div>
  );
}
