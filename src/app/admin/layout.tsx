import { Inter } from "next/font/google";
import { AdminLayoutClient } from "@/modules/admin/components/AdminLayoutClient";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin-sans",
  display: "swap",
});

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${inter.variable} min-h-screen [font-family:var(--font-admin-sans),ui-sans-serif,system-ui,sans-serif]`}
    >
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </div>
  );
}
