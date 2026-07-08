import { Inter } from "next/font/google";
import { AdminLayoutClient } from "@/modules/admin/components/AdminLayoutClient";
import { AuthProvider } from "@/modules/auth/context/AuthContext";
import { authService } from "@/modules/auth/services/auth.service";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin-sans",
  display: "swap",
});

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await authService.getServerSession();

  return (
    <div
      className={`${inter.variable} min-h-screen [font-family:var(--font-admin-sans),ui-sans-serif,system-ui,sans-serif]`}
    >
      <AuthProvider initialUser={session}>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </AuthProvider>
    </div>
  );
}
