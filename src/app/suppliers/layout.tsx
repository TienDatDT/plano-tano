import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin-sans",
  display: "swap",
});

export default function SuppliersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${inter.variable} [font-family:var(--font-admin-sans),ui-sans-serif,system-ui,sans-serif]`}
    >
      {children}
    </div>
  );
}
