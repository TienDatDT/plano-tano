"use client";

import type { ProductJson } from "@/modules/product/lib/serializeProduct";
import { PanelRightClose, Plus } from "lucide-react";
import { SKUDataTable } from "./SKUDataTable";

interface SKUDetailPanelProps {
  product: ProductJson;
  onCollapse: () => void;
  onEditProduct: () => void;
  onAddVariant: () => void;
  selectedRowIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onUpdateVariant: (id: string, data: Partial<ProductJson["variants"][number]>) => Promise<void>;
  onDeleteVariant: (id: string) => void;
  onEditVariant: (id: string) => void;
}

export function SKUDetailPanel({
  product,
  onCollapse,
  onEditProduct,
  onAddVariant,
  selectedRowIds,
  onToggleRow,
  onToggleAll,
  onUpdateVariant,
  onDeleteVariant,
  onEditVariant,
}: SKUDetailPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] border border-premium-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-premium-border bg-premium-surface shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onCollapse}
            className="p-1.5 text-premium-muted hover:text-neutral-900 hover:bg-neutral-200/50 rounded-lg transition-colors"
            title={"Collapse Panel"}
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-neutral-900 truncate max-w-[200px] xl:max-w-[300px]">
            {product.name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onEditProduct}
            className="px-3 py-1.5 text-sm font-semibold text-neutral-700 bg-white border border-premium-border rounded-lg shadow-sm hover:bg-neutral-50 transition-colors"
          >
            {"Edit"}
          </button>
          <button 
            onClick={onAddVariant}
            className="px-3 py-1.5 text-sm font-bold text-white bg-premium-primary rounded-lg shadow-soft hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> {"Add SKU"}
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-[#fafbfc]">
        <SKUDataTable 
          variants={product.variants}
          selectedRowIds={selectedRowIds}
          onToggleRow={onToggleRow}
          onToggleAll={onToggleAll}
          onUpdateVariant={onUpdateVariant}
          onDeleteVariant={onDeleteVariant}
          onEditVariant={onEditVariant}
        />
      </div>
    </div>
  );
}
