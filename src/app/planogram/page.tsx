import { StoreView } from "@/modules/planogram/components/StoreView";
import Link from "next/link";

export default function PlanogramPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col font-sans">
      <StoreView />
    </div>
  );
}
