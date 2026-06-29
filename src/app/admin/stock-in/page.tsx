import { StockInContent } from "@/modules/stock-in/components/StockInContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock In | TanaPlano Admin",
  description: "Manage and track inventory receipts from suppliers.",
};

export default function StockInPage() {
  return <StockInContent />;
}
