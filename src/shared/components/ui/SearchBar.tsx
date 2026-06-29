"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceTime?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  debounceTime = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync internal state with prop if prop changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce logic moved to the component level for convenience
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value, debounceTime]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className={cn("relative w-full transition-all", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search className="h-4 w-4 text-premium-muted group-focus-within:text-premium-primary transition-colors" />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className={cn(
          "h-11 w-full rounded-xl border border-premium-border bg-premium-bg/50 pl-10 pr-10 text-sm font-medium outline-none ring-premium-primary/20 transition-all",
          "focus:border-premium-primary focus:bg-white focus:ring-4",
          "placeholder:text-premium-muted/60"
        )}
        placeholder={placeholder}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-premium-muted hover:text-neutral-900 transition-colors"
          title={"Clear search"}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
