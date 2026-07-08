import { Search, X } from "lucide-react";

interface UserFilterBarProps {
  query: string;
  setQuery: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
}

export function UserFilterBar({
  query,
  setQuery,
  role,
  setRole,
  status,
  setStatus,
}: UserFilterBarProps) {
  const hasActiveFilters = query !== "" || role !== "all" || status !== "all";

  const clearFilters = () => {
    setQuery("");
    setRole("all");
    setStatus("all");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tên, email..."
          className="w-full rounded-xl border border-premium-border bg-premium-bg/50 py-2.5 pl-10 pr-4 text-sm text-neutral-900 transition-colors focus:border-premium-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-premium-primary dark:bg-black/50 dark:text-white dark:focus:bg-black"
        />
      </div>

      <div className="flex flex-1 items-center gap-3 sm:flex-none">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-10 cursor-pointer appearance-none rounded-xl border border-premium-border bg-premium-bg/50 px-4 pr-10 text-sm font-medium text-neutral-700 transition-colors focus:border-premium-primary focus:outline-none focus:ring-1 focus:ring-premium-primary dark:bg-black/50 dark:text-neutral-300"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' class='w-4 h-4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
            backgroundPosition: "right 12px center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "16px",
          }}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị viên (ADMIN)</option>
          <option value="STAFF">Nhân viên (STAFF)</option>
          <option value="VIEWER">Khách (VIEWER)</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 cursor-pointer appearance-none rounded-xl border border-premium-border bg-premium-bg/50 px-4 pr-10 text-sm font-medium text-neutral-700 transition-colors focus:border-premium-primary focus:outline-none focus:ring-1 focus:ring-premium-primary dark:bg-black/50 dark:text-neutral-300"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' class='w-4 h-4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
            backgroundPosition: "right 12px center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "16px",
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã vô hiệu hóa</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-premium-border bg-white px-4 text-sm font-bold text-premium-muted hover:bg-premium-bg hover:text-neutral-900 dark:bg-black dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
