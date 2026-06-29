"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Filter, X, ChevronDown, RotateCcw } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FilterPanelProps {
  children: ReactNode;
  onReset: () => void;
  activeCount?: number;
  className?: string;
  label?: string;
}

export function FilterPanel({
  children,
  onReset,
  activeCount = 0,
  className,
  label = "Filters",
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block", className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all active:scale-[0.98]",
          isOpen || activeCount > 0
            ? "border-premium-primary bg-premium-subtle/50 text-premium-primary ring-4 ring-premium-primary/10"
            : "border-premium-border bg-premium-bg/50 text-premium-muted hover:border-premium-primary hover:bg-white"
        )}
      >
        <Filter className="h-4 w-4" />
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-premium-primary px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 origin-top-right rounded-2xl border border-premium-border bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="mb-4 flex items-center justify-between border-b border-premium-border pb-3">
            <h3 className="text-sm font-bold text-neutral-900">{"Filter Options"}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-premium-muted hover:bg-premium-bg hover:text-neutral-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5">{children}</div>

          <div className="mt-6 flex items-center gap-3 border-t border-premium-border pt-4">
            <button
              onClick={() => {
                onReset();
                setIsOpen(false);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-premium-muted hover:bg-premium-bg transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {"Reset All"}</button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-xl bg-premium-primary py-2 text-xs font-bold text-white shadow-soft transition-all hover:bg-premium-primary/90 active:scale-[0.98]"
            >
              {"Apply Filter"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  children: ReactNode;
}

export function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-wider text-premium-muted/80">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

interface FilterOptionProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

export function FilterOption({ active, onClick, label }: FilterOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-all ring-1 ring-inset",
        active
          ? "bg-premium-primary text-white ring-premium-primary"
          : "bg-premium-bg/50 text-premium-muted ring-premium-border hover:bg-premium-bg hover:text-neutral-900"
      )}
    >
      {label}
    </button>
  );
}
