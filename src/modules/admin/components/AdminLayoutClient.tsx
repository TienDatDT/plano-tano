"use client";

import { AdminSearchProvider } from "@/modules/admin/context/AdminSearchContext";
import { usePathname } from "next/navigation";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { LanguageProvider } from "./LanguageContext";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShelves = pathname.startsWith("/admin/shelves");
  const showSearch = pathname.startsWith("/admin/products") || isShelves;

  return (
    <LanguageProvider>
      <AdminSearchProvider>
        <div className="flex min-h-screen bg-premium-bg text-neutral-800">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminHeader
              showSearch={showSearch}
              searchPlaceholder={isShelves ? "Search shelves..." : "Search products by name…"}
            />
            <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 bg-premium-bg/40">
              <div className="mx-auto max-w-[1600px]">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AdminSearchProvider>
    </LanguageProvider>
  );
}

