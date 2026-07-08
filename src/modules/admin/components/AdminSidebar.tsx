"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  ClipboardCheck,
  ShoppingBag,
  Layout,
  CreditCard,
  Settings,
  Scale,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  Map,
  Warehouse,
  Zap,
  Menu,
  X,
  LogOut,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/modules/auth/context/AuthContext";
import { hasPermission } from "@/modules/auth/config/permissions";

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { currentUser, signOut } = useAuth();

  // Tự đóng sidebar mobile mỗi khi chuyển trang
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Khoá scroll nền khi sidebar mobile đang mở
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const nav = [
    {
      href: "/admin/dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      href: "/admin/products",
      label: t("nav.products"),
      icon: Package,
    },
    {
      href: "/admin/stock-in",
      label: t("nav.stockIn"),
      icon: ClipboardCheck,
    },
    {
      href: "/admin/stock",
      label: t("nav.stock"),
      icon: Warehouse,
    },
    {
      href: "/admin/suppliers",
      label: t("nav.suppliers"),
      icon: Truck,
    },
    {
      href: "/admin/categories",
      label: t("nav.categories"),
      icon: Layout,
    },
    {
      href: "/admin/orders",
      label: t("nav.orders"),
      icon: ShoppingBag,
    },
    {
      href: "/admin/emergency-invoices",
      label: t("nav.emergencyInvoice"),
      icon: Zap,
    },
    {
      href: "/admin/reports/daily",
      label: t("nav.dailyReport"),
      icon: TrendingUp,
    },
    {
      href: "/admin/units",
      label: t("nav.units"),
      icon: Scale,
    },
    {
      href: "/admin/store-layout",
      label: t("nav.storeLayout"),
      icon: Map,
    },
    {
      href: "/admin/planogram",
      label: t("nav.planogram"),
      icon: Layout,
    },
    {
      href: "/admin/shelves",
      label: t("nav.shelves"),
      icon: LayoutGrid,
    },
    {
      href: "/pos",
      label: t("nav.pos"),
      icon: CreditCard,
    },
    {
      href: "/admin/users",
      label: "Quản lý người dùng", // Hoặc t("nav.users") nếu đã thêm vào i18n
      icon: Users,
    },
  ];

  // Filter routes based on user role
  const filteredNav = nav.filter((item) => hasPermission(item.href, currentUser?.role || 'VIEWER'));

  return (
    <>
      {/* Nút mở menu - chỉ hiện trên mobile/tablet (< lg) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở menu"
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-premium-border bg-white shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5 text-premium-muted" />
      </button>

      {/* Overlay nền - chỉ hiện khi sidebar mobile đang mở */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-premium-border bg-white py-6 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 pb-8">
          <Link
            href="/admin/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-2xl px-2 py-1 transition-all duration-300 hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--image-gold-gradient)] text-white shadow-gold">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-neutral-900">
                TanaPlano
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-premium-primary">
                {t("nav.management")}
              </span>
            </div>
          </Link>

          {/* Nút đóng - chỉ hiện trên mobile/tablet */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-premium-muted transition-colors hover:bg-premium-bg lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4"
          aria-label="Main"
        >
          {filteredNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-premium-primary/10 text-premium-primary shadow-sm ring-1 ring-premium-primary/20"
                    : "text-premium-muted hover:bg-premium-bg hover:text-premium-primary"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    active
                      ? "text-premium-primary"
                      : "opacity-70 group-hover:opacity-100 group-hover:text-premium-primary"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 border-t border-premium-border/50 pt-4 flex flex-col gap-1">
          {currentUser && (
            <div className="flex items-center gap-3 px-3.5 py-3 mb-2 rounded-xl bg-premium-bg/50 border border-premium-border/50">
              <div className="h-8 w-8 rounded-full bg-premium-primary/10 flex items-center justify-center text-premium-primary font-bold shadow-sm">
                {currentUser.fullName?.[0] || currentUser.email[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold text-neutral-900 truncate">
                  {currentUser.fullName || "User"}
                </span>
                <span className="text-[10px] font-bold text-premium-muted uppercase">
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}

          <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-premium-muted transition-all hover:bg-premium-bg hover:text-premium-primary">
            <Settings className="h-5 w-5 opacity-70" />
            <span>{t("nav.settings")}</span>
          </button>
          
          <button 
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-500/70 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10"
          >
            <LogOut className="h-5 w-5 opacity-70" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}