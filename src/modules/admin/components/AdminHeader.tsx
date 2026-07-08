"use client";

import { useAdminSearch } from "@/modules/admin/context/AdminSearchContext";
import { Search, Bell, User, HelpCircle, Globe } from "lucide-react";
import { ThemeSwitcher } from "@/shared/theme/components/ThemeSwitcher";
import { useRouter, usePathname } from "next/navigation";
import i18n from "@/lib/i18n";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/modules/auth/context/AuthContext";

type AdminHeaderProps = {
  /** When false, search is hidden (e.g. suppliers page). */
  showSearch?: boolean;
  searchPlaceholder?: string;
};

export function AdminHeader({
  showSearch = true,
  searchPlaceholder = "Search products…",
}: AdminHeaderProps) {
  const { query, setQuery } = useAdminSearch();
  const {i18n} = useTranslation();
  const { currentUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-premium-border bg-premium-bg/40 px-6 backdrop-blur-xl sm:px-8">
      {showSearch ? (
        <div className="relative min-w-0 flex-1 max-w-lg group">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-muted/60 transition-colors group-focus-within:text-premium-primary" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-premium-border bg-white/60 py-2.5 pl-10 pr-4 text-sm text-neutral-900 shadow-sm outline-none transition-all placeholder:text-neutral-400 focus:border-premium-primary/40 focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
            aria-label="Search"
          />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-premium-border text-premium-muted transition-all hover:bg-premium-bg hover:text-premium-primary shadow-sm hover:shadow"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-premium-primary ring-2 ring-white" />
        </button>

        <ThemeSwitcher />

        <button
          type="button"
          className="flex h-10 px-3 items-center justify-center gap-1.5 rounded-xl bg-white border border-premium-border text-premium-muted transition-all hover:bg-premium-bg hover:text-premium-primary shadow-sm hover:shadow font-bold text-xs uppercase"
          aria-label="Toggle language"
          onClick={() => i18n.changeLanguage(i18n.language === "en" ? "vi" : "en")}
        >
          <Globe className="h-4 w-4 text-premium-muted/80" />
          <span>{i18n.language.toUpperCase()}</span>
        </button>


        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-premium-border text-premium-muted transition-all hover:bg-premium-bg hover:text-premium-primary lg:hidden shadow-sm hover:shadow"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="h-8 w-px bg-premium-border/60 mx-1 hidden sm:block" />

        <button
          type="button"
          className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl transition-all hover:bg-premium-accent/30 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-premium-bg text-premium-primary ring-1 ring-premium-border/50 shadow-sm group-hover:bg-premium-primary group-hover:text-white transition-colors">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-bold text-neutral-900 dark:text-white leading-none">
              {currentUser?.fullName || "Người dùng"}
            </p>
            <p className="text-[10px] font-bold text-premium-muted mt-1 uppercase tracking-wider opacity-70">
              {currentUser?.role || "Khách"}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}

