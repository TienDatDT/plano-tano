"use client";

import { Box, Scale } from "lucide-react";

interface UnitFilterBarProps {
  activeTab: "units" | "conversions";
  onTabChange: (tab: "units" | "conversions") => void;
}

export function UnitFilterBar({ activeTab, onTabChange }: UnitFilterBarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Custom Tab Switcher - Moved to Filter Bar to match Reference Structure */}
        <div className="inline-flex items-center rounded-2xl bg-premium-subtle p-1.5 shadow-sm ring-1 ring-premium-border/50">
          <button
            onClick={() => onTabChange("units")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
              activeTab === "units"
                ? "bg-premium-surface text-premium-primary shadow-soft"
                : "text-premium-muted hover:text-premium-primary"
            }`}
          >
            <Box className="h-4 w-4" />
            <span>{"Units"}</span>
          </button>
          <button
            onClick={() => onTabChange("conversions")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
              activeTab === "conversions"
                ? "bg-premium-surface text-premium-primary shadow-soft"
                : "text-premium-muted hover:text-premium-primary"
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>{"Unit Conversions"}</span>
          </button>
        </div>

        {/* Note: Placeholder for SearchBar if needed later, 
            keeping it simple to match "DO NOT add new features" 
            while following the structure of SupplierFilterBar */}
      </div>
    </div>
  );
}
