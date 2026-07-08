import { UserRow } from "../types";
import { X, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth/context/AuthContext";

export function UserDrawer({ user, open, onClose, onSuccess }: { user: UserRow | null; open: boolean; onClose: () => void; onSuccess: () => void; }) {
  const [role, setRole] = useState<string>("STAFF");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setIsActive(user.isActive);
    }
  }, [user]);

  if (!open || !user) return null;

  const isSelf = currentUser?.id === user.id;

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, isActive }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      
      toast.success("Cập nhật thành công!");
      onSuccess();
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
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl dark:bg-[oklch(0.18_0.02_85)] animate-in slide-in-from-right duration-300 border-l border-premium-border/50">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-premium-border/50 px-6 py-4">
            <h2 className="text-lg font-bold">Chỉnh sửa người dùng</h2>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-premium-bg dark:hover:bg-neutral-800">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6 flex items-center gap-4 rounded-xl bg-premium-bg/50 p-4 dark:bg-black/20 border border-premium-border/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-premium-primary/10 text-lg font-bold text-premium-primary">
                {user.fullName?.[0] || user.email[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">{user.fullName || "Chưa cập nhật"}</p>
                <p className="text-sm text-premium-muted">{user.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-white">Vai trò hệ thống</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isSelf && user.role === 'ADMIN'}
                  className="w-full rounded-xl border border-premium-border bg-white px-4 py-2.5 text-sm transition-colors focus:border-premium-primary focus:outline-none focus:ring-1 focus:ring-premium-primary dark:bg-black/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  <option value="STAFF">Nhân viên (STAFF)</option>
                  <option value="VIEWER">Khách (VIEWER)</option>
                </select>
                {isSelf && user.role === 'ADMIN' && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
                    <ShieldAlert className="h-3.5 w-3.5" /> Không thể tự hạ quyền chính mình
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-white">Trạng thái tài khoản</label>
                <div className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                  isActive 
                    ? "border-premium-primary/20 bg-premium-primary/5 dark:bg-premium-primary/10" 
                    : "border-premium-border bg-premium-bg/50 dark:bg-black/20"
                }`}>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">Cho phép truy cập</p>
                    <p className="text-xs text-premium-muted mt-0.5">Tài khoản này có thể đăng nhập vào hệ thống</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={isSelf} />
                    <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-premium-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-neutral-700 disabled:peer-checked:opacity-60"></div>
                  </label>
                </div>
                {isSelf && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
                    <ShieldAlert className="h-3.5 w-3.5" /> Không thể tự vô hiệu hóa chính mình
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-premium-border/50 p-6 flex gap-3 bg-white dark:bg-[oklch(0.18_0.02_85)]">
            <button onClick={onClose} className="flex-1 rounded-xl bg-premium-bg py-2.5 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
              Hủy
            </button>
            <button onClick={handleSave} disabled={isLoading} className="flex-1 rounded-xl bg-[image:var(--image-gold-gradient)] py-2.5 text-sm font-bold text-white shadow-[var(--shadow-gold)] transition-opacity hover:opacity-90 disabled:opacity-70 flex justify-center items-center gap-2">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
