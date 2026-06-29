import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

import "@/lib/i18n";

import { AlertProvider } from "@/shared/components/AlertProvider";
import { ThemeProvider } from "@/shared/theme/contexts/ThemeContext";
import I18nProvider from "@/shared/providers/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TanaPlano - Stationery System",
  description: "Stationery inventory and planogram system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <I18nProvider>
            <AlertProvider>{children}</AlertProvider>
          </I18nProvider>

          <Toaster position="top-left" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}