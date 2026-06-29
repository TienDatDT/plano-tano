import { DailyReportDashboard } from "@/modules/reports/components/DailyReportDashboard";

export const metadata = {
  title: "Daily Report | Admin Dashboard",
  description: "Daily inventory and sales performance analytics",
};

export default function DailyReportPage() {
  return <DailyReportDashboard />;
}
