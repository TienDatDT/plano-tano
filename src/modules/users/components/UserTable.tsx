import { UserRow } from "../types";
import { Edit2, ShieldAlert, ShieldCheck, Shield } from "lucide-react";

export function UserTable({ users, isLoading, onEdit }: { users: UserRow[]; isLoading: boolean; onEdit: (user: UserRow) => void; }) {
  if (isLoading) return <div className="p-8 text-center text-premium-muted">Đang tải...</div>;
  
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-premium-bg">
          <Shield className="h-6 w-6 text-premium-muted" />
        </div>
        <p className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">Không tìm thấy người dùng</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
        <thead className="bg-premium-bg/50 text-xs font-bold uppercase text-neutral-900 dark:bg-black/50 dark:text-neutral-300">
          <tr>
            <th className="px-4 py-3 rounded-l-xl">Người dùng</th>
            <th className="px-4 py-3">Vai trò</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3 rounded-r-xl text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-premium-border/50">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-premium-bg/30 dark:hover:bg-black/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-premium-primary/10 text-xs font-bold text-premium-primary">
                    {user.fullName?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-neutral-900 dark:text-white">{user.fullName || "Chưa cập nhật"}</span>
                    <span className="text-xs text-premium-muted">{user.email}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold ${
                  user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  user.role === 'STAFF' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {user.role === 'ADMIN' ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${
                  user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                </span>
              </td>
              <td className="px-4 py-3 text-xs">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(user)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-premium-muted hover:bg-premium-bg hover:text-premium-primary transition-colors dark:hover:bg-neutral-800"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
