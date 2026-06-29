import { StoreLayoutBuilder } from "@/modules/store-layout/components/StoreLayoutBuilder";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Layout Builder | TanaPlano Admin",
  description: "Design and manage your store's physical floor plan and shelving arrangements.",
};

export default function StoreLayoutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-neutral-900">{"Floor Plan & Store Layout"}</h1>
        <p className="text-sm text-premium-muted">
          {"Drag and drop shelf templates onto the grid to design your store's physical arrangement."}</p>
      </div>

      <StoreLayoutBuilder />
    </div>
  );
}
