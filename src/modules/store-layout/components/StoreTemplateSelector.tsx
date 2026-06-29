"use client";

import React, { useState, useMemo } from "react";
import { 
  Store, 
  ShoppingBag, 
  PlusCircle, 
  Layout, 
  CheckCircle2,
  Package,
  Zap,
  Shirt,
  Search
} from "lucide-react";

export interface TemplateData {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  shelves: any[]; // Predefined shelf placements
}

const TEMPLATES: TemplateData[] = [
  {
    id: "supermarket",
    name: "Supermarket",
    description: "Grid layout with multiple parallel aisles and high density.",
    icon: ShoppingBag,
    color: "bg-blue-50 border-blue-200 text-blue-600",
    shelves: [
      { id: "s1", name: "Produce", width: 4, height: 1, posX: 2, posY: 2, color: "bg-emerald-100 border-emerald-300 text-emerald-700" },
      { id: "s2", name: "Aisle 1", width: 1, height: 6, posX: 8, posY: 2, color: "bg-teal-100 border-teal-300 text-teal-700" },
      { id: "s3", name: "Aisle 2", width: 1, height: 6, posX: 11, posY: 2, color: "bg-teal-100 border-teal-300 text-teal-700" },
      { id: "s4", name: "Checkout", width: 2, height: 2, posX: 2, posY: 11, color: "bg-premium-secondary/20 border-premium-secondary text-premium-primary" },
    ]
  },
  {
    id: "convenience",
    name: "Convenience Store",
    description: "Compact layout optimized for quick flow and essential items.",
    icon: Zap,
    color: "bg-orange-50 border-orange-200 text-orange-600",
    shelves: [
      { id: "c1", name: "Drinks", width: 4, height: 1, posX: 1, posY: 1, color: "bg-blue-100 border-blue-300 text-blue-700" },
      { id: "c2", name: "Snacks", width: 3, height: 1, posX: 1, posY: 4, color: "bg-orange-100 border-orange-300 text-orange-700" },
      { id: "c3", name: "Counter", width: 2, height: 2, posX: 6, posY: 6, color: "bg-premium-secondary/20 border-premium-secondary text-premium-primary" },
    ]
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    description: "Clear zoning with professional counters and organized shelves.",
    icon: PlusCircle,
    color: "bg-green-50 border-green-200 text-green-600",
    shelves: [
      { id: "p1", name: "Prescriptions", width: 4, height: 2, posX: 10, posY: 1, color: "bg-green-100 border-green-300 text-green-700" },
      { id: "p2", name: "OTC", width: 1, height: 4, posX: 2, posY: 2, color: "bg-emerald-100 border-emerald-300 text-emerald-700" },
      { id: "p3", name: "Beauty", width: 1, height: 4, posX: 5, posY: 2, color: "bg-teal-100 border-teal-300 text-teal-700" },
    ]
  },
  {
    id: "fashion",
    name: "Fashion Boutique",
    description: "Open layout with spacious display areas and minimalist shelves.",
    icon: Shirt,
    color: "bg-purple-50 border-purple-200 text-purple-600",
    shelves: [
      { id: "f1", name: "Main Rack", width: 4, height: 1, posX: 5, posY: 4, color: "bg-purple-100 border-purple-300 text-purple-700" },
      { id: "f2", name: "Mannequins", width: 2, height: 2, posX: 2, posY: 2, color: "bg-pink-100 border-pink-300 text-pink-700" },
      { id: "f3", name: "Fitting Rooms", width: 2, height: 2, posX: 12, posY: 10, color: "bg-premium-secondary/20 border-premium-secondary text-premium-primary" },
    ]
  }
];

interface StoreTemplateSelectorProps {
  onSelect: (template: TemplateData) => void;
  currentTemplateId?: string;
}

export function StoreTemplateSelector({ onSelect, currentTemplateId }: StoreTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return TEMPLATES;
    const lowerQuery = searchQuery.toLowerCase();
    return TEMPLATES.filter((t) => 
      t.name.toLowerCase().includes(lowerQuery) || 
      t.description.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-premium-primary">{"Store Templates"}</h3>
          <p className="text-xs text-premium-muted">{"Choose a starting layout"}</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-premium-muted" />
          <input
            type="text"
            placeholder={"Search templates..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-premium-border bg-white py-2.5 pl-9 pr-4 text-sm font-medium focus:border-premium-primary focus:outline-none focus:ring-2 focus:ring-premium-primary/10 transition-all placeholder:font-normal"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => {
            const Icon = template.icon;
            const isSelected = currentTemplateId === template.id;
            
            return (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className={`group relative flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md active:scale-[0.98] ${
                  isSelected 
                    ? "border-premium-primary bg-premium-subtle" 
                    : "border-premium-border bg-white hover:border-premium-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${template.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate text-sm font-bold text-neutral-900">{template.name}</h4>
                    <p className="text-[10px] font-medium text-premium-muted line-clamp-1">{template.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-premium-primary shrink-0" />
                  )}
                </div>

                {/* Mini Preview Visualization */}
                <div className="h-12 w-full rounded-lg bg-neutral-50/50 p-2 overflow-hidden border border-neutral-100">
                  <div className="relative h-full w-full">
                    {template.shelves.slice(0, 3).map((s, i) => (
                      <div 
                        key={i}
                        className={`absolute rounded-sm border opacity-40 ${s.color}`}
                        style={{
                          left: `${(s.posX / 20) * 100}%`,
                          top: `${(s.posY / 15) * 100}%`,
                          width: `${(s.width / 20) * 100}%`,
                          height: `${(s.height / 15) * 100}%`,
                        }}
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-50/80 to-transparent" />
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs font-medium text-premium-muted">
            {"No templates found."}</div>
        )}
      </div>
    </div>
  );
}
