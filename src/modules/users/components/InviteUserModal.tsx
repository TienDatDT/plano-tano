import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { inviteUserSchema, InviteUserDto } from "../types";

export function InviteUserModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void; }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserDto>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      role: "STAFF",
    },
  });

  if (!open) return null;

  const onSubmit = async (data: InviteUserDto) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!resData.success) throw new Error(resData.error?.message);
      
      toast.success("Đã gửi lời mời qua email!");
      onSuccess();
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[oklch(0.18_0.02_85)] border border-premium-border/50">
          <div className="flex items-center justify-between border-b border-premium-border/50 px-6 py-4 bg-premium-bg/30 dark:bg-black/20">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Thêm người dùng mới</h2>
            <button onClick={onClose} className="rounded-lg p-2 text-premium-muted hover:bg-premium-bg dark:hover:bg-neutral-800 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-neutral-300">
                  Địa chỉ Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-muted/60" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="email@congty.com"
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-premium-primary focus:outline-none focus:ring-1 focus:ring-premium-primary dark:bg-black/50 dark:text-white ${
                      errors.email ? "border-red-400" : "border-premium-border"
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>}
                <p className="mt-2 text-xs text-premium-muted">Hệ thống sẽ gửi một email mời tạo mật khẩu đến địa chỉ này.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-neutral-300">
                  Họ và tên (Tùy chọn)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-muted/60" />
                  <input
                    {...register("fullName")}
                    type="text"
                    placeholder="Nguyễn Văn A"
                    disabled={isLoading}
                    className="w-full rounded-xl border border-premium-border bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-premium-primary focus:outline-none focus:ring-1 focus:ring-premium-primary dark:bg-black/50 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-neutral-300">
                  Vai trò hệ thống <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("role")}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-premium-border bg-white px-4 py-2.5 text-sm transition-all focus:border-premium-primary focus:outline-none focus:ring-1 focus:ring-premium-primary dark:bg-black/50 dark:text-neutral-300"
                >
                  <option value="ADMIN">Quản trị viên (ADMIN) - Toàn quyền</option>
                  <option value="STAFF">Nhân viên (STAFF) - Nhập bán hàng</option>
                  <option value="VIEWER">Khách (VIEWER) - Chỉ xem báo cáo</option>
                </select>
                {errors.role && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.role.message}</p>}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-premium-border/50">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-premium-bg px-5 py-2.5 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-[image:var(--image-gold-gradient)] px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-gold)] transition-all hover:opacity-90 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi lời mời"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
