"use client";

import React from "react";
import { X, Library, LayoutTemplate } from "lucide-react";
import { ShelfLibrary } from "./ShelfLibrary";

interface TemplateSidebarProps {
  leftSidebarOpen: boolean;
  onCloseLeftSidebar: () => void;
  activeTab: string;
  onSetActiveTab: (tab: string) => void;
  placedShelfIds: Set<string>;
}

function TemplateSidebarComponent({
  leftSidebarOpen,
  onCloseLeftSidebar,
  activeTab,
  onSetActiveTab,
  placedShelfIds,
}: TemplateSidebarProps) {
  return (
    <aside
      className={`absolute z-30 xl:relative xl:flex w-80 shrink-0 flex-col gap-4 overflow-hidden rounded-3xl border border-premium-border bg-white/95 xl:bg-premium-surface/50 p-6 backdrop-blur-xl shadow-2xl xl:shadow-sm transition-transform h-full ${
        leftSidebarOpen ? "translate-x-0" : "-translate-x-[120%] xl:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between xl:hidden mb-2">
        <h3 className="text-sm font-bold text-neutral-900">{"Library"}</h3>
        <button
          onClick={onCloseLeftSidebar}
          className="p-1.5 rounded-lg text-premium-muted hover:bg-premium-bg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex p-1 bg-premium-bg/30 rounded-2xl border border-premium-border">
        <button
          onClick={() => onSetActiveTab("library")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "library"
              ? "bg-white text-premium-primary shadow-sm"
              : "text-premium-muted hover:text-premium-primary"
          }`}
        >
          <Library className="h-4 w-4" />
          <span>{"Objects"}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <ShelfLibrary placedShelfIds={placedShelfIds} />
      </div>
    </aside>
  );
}

export const TemplateSidebar = React.memo(TemplateSidebarComponent);
