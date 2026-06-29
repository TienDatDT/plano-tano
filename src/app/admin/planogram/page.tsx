import { Suspense } from "react";
import { PlanogramWorkspace } from "@/modules/planogram/components/PlanogramWorkspace";
import { Metadata } from "next";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Planogram Editor | TanaPlano Admin",
  description:
    "Place and arrange product variants onto shelf grids. Drag products into cells and save your planogram.",
};

export default function AdminPlanogramPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-premium-primary">
            <span className="text-xs font-extrabold uppercase tracking-widest">
              {"Planogram"}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            {"Product Placement"}</h1>
          <p className="text-sm text-premium-muted max-w-xl">
            {"Select a shelf, then drag products from the inventory into the grid cells. Each placement maps to a"}{" "}
            <code className="text-xs font-bold bg-premium-subtle text-premium-primary px-1.5 py-0.5 rounded-md">
              {"ShelfItem"}</code>
            .
          </p>
        </div>
      </div>

      {/* Workspace — wrapped in Suspense for useSearchParams */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64 gap-3 text-premium-muted">
            <Loader2 className="w-6 h-6 animate-spin text-premium-primary" />
            <span className="text-sm font-semibold">{"Loading workspace…"}</span>
          </div>
        }
      >
        <PlanogramWorkspace />
      </Suspense>
    </div>
  );
}
