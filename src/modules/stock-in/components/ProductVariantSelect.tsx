"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface Variant {
  id: string;
  sku: string;
  name: string;
  variantName?: string;
  price?: number;
}

interface ProductVariantSelectProps {
  value: string;
  onChange: (variant: Variant) => void;
  variants: Variant[];
  placeholder?: string;
}

export function ProductVariantSelect({
  value,
  onChange,
  variants,
  placeholder = "Search product...",
}: ProductVariantSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedVariant = useMemo(() => 
    variants.find((v) => v.id === value), 
    [variants, value]
  );

  const filteredVariants = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return variants.slice(0, 10);
    return variants.filter(
      (v) => 
        v.name.toLowerCase().includes(q) || 
        v.sku.toLowerCase().includes(q) ||
        (v.variantName && v.variantName.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [variants, query]);

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
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-all focus:ring-4 ${
          isOpen 
            ? "border-premium-secondary bg-premium-surface ring-premium-secondary/20 shadow-sm" 
            : "border-premium-border bg-premium-bg/40 hover:bg-premium-bg/60"
        }`}
      >
        <span className={selectedVariant ? "text-neutral-900" : "text-neutral-400"}>
          {selectedVariant ? (
            <span className="flex items-center gap-2">
              <span className="font-semibold">{selectedVariant.name}</span>
              {selectedVariant.variantName && <span className="text-premium-muted">— {selectedVariant.variantName}</span>}
            </span>
          ) : placeholder}
        </span>
        <IconChevronDown className={`h-4 w-4 text-premium-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[320px] rounded-2xl border border-premium-border bg-premium-surface p-2 shadow-[0_12px_40px_rgba(47,87,68,0.15)] animate-in fade-in zoom-in-95 duration-100">
          <div className="relative mb-2">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-premium-muted" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={"Type to search SKU or name..."}
              className="w-full rounded-xl border-none bg-premium-bg/40 py-2.5 pl-10 pr-4 text-sm outline-none focus:bg-premium-bg/60"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredVariants.length > 0 ? (
              filteredVariants.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(v);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`w-full flex flex-col items-start px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-premium-subtle/50 ${
                      v.id === value ? "bg-premium-subtle/30" : ""
                    }`}
                  >
                    <div className="flex w-full justify-between items-center">
                      <span className="font-medium text-neutral-900">{v.name}</span>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-premium-primary bg-premium-primary/5 px-2 py-0.5 rounded-full ring-1 ring-premium-primary/20">
                        {v.sku}
                      </span>
                    </div>
                    {v.variantName && <div className="text-xs text-premium-muted mt-0.5">{v.variantName}</div>}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center text-sm text-premium-muted italic">
                {"No variants found matching \""}{query}"
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
    </svg>
  );
}
