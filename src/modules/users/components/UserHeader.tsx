import { Plus, Users } from "lucide-react";

interface UserHeaderProps {
  totalUsers: number;
  onInviteClick: () => void;
}

export function UserHeader({ totalUsers, onInviteClick }: UserHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          <Users className="h-6 w-6 text-premium-primary" />
          Quản lý người dùng
        </h1>
        <p className="mt-1 text-sm text-premium-muted">
          Quản lý tài khoản, phân quyền và trạng thái của nhân viên trong hệ thống.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm border border-premium-border dark:bg-black">
          <span className="text-sm font-medium text-premium-muted">Tổng số</span>
          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-premium-primary/10 px-2 text-xs font-bold text-premium-primary">
            {totalUsers}
          </span>
        </div>

        <button
          onClick={onInviteClick}
          className="group flex h-10 items-center justify-center gap-2 rounded-xl bg-premium-primary px-4 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={3} />
          Mời người dùng
        </button>
      </div>
    </div>
  );
}
