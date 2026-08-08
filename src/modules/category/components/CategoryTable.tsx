"use client";

import { useMemo, useTransition } from "react";
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Package, 
  Calendar,
  ChevronRight,
  Tags
} from "lucide-react";
import { useTranslation } from "react-i18next";


interface Category {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  const { t } = useTranslation();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-premium-border bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-premium-border bg-premium-bg/50">
              <th className="px-6 py-4 font-bold text-premium-muted uppercase">{t("categories.table.name")}</th>
              <th className="px-6 py-4 font-bold text-premium-muted uppercase">{t("categories.table.description")}</th>
              <th className="px-6 py-4 font-bold text-premium-muted uppercase text-center">{t("categories.table.productCount")}</th>
              <th className="px-6 py-4 font-bold text-premium-muted uppercase">{t("categories.table.createdAt")}</th>
              <th className="px-6 py-4 font-bold text-premium-muted uppercase">{t("categories.table.updatedAt")}</th>
              <th className="px-6 py-4 font-bold text-premium-muted uppercase text-right pr-8">{t("categories.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-premium-border">
            {categories.map((category) => (
              <tr 
                key={category.id} 
                className="group cursor-pointer transition-colors hover:bg-premium-subtle/30"
                onClick={() => onEdit(category)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-premium-bg text-premium-primary group-hover:bg-premium-accent/30 transition-colors">
                      <span className="text-xs font-bold uppercase">{category.name.substring(0, 2)}</span>
                    </div>
                    <span className="font-bold text-neutral-900">{category.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="line-clamp-1 text-premium-muted max-w-xs">
                    {category.description || "—"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-premium-subtle px-2.5 py-0.5 font-bold text-premium-primary">
                    <Package className="h-3 w-3" />
                    <span>{category.productCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-premium-muted">
                    <Calendar className="h-3.5 w-3.5 opacity-50" />
                    <span>{formatDate(category.createdAt)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-premium-muted">
                  {formatDate(category.updatedAt)}
                </td>
                <td className="px-6 py-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => onEdit(category)}
                      className="rounded-lg p-2 text-premium-muted transition-colors hover:bg-premium-subtle hover:text-premium-primary"
                      title={"Edit Category"}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(category.id)}
                      className="rounded-lg p-2 text-premium-muted transition-colors hover:bg-red-50 hover:text-red-500"
                      title={"Delete Category"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-premium-bg text-premium-primary">
            <Tags size={32} className="opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">{"No categories found"}</h3>
          <p className="mt-1 text-sm text-premium-muted">{"Create your first category to start organizing your inventory."}</p>
        </div>
      )}
    </div>
  );
}
