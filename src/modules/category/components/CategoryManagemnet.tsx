"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { CategoryHeader } from "./CategoryHeader";
import { CategoryTable } from "./CategoryTable";
import { CategoryDrawer } from "./CategoryDrawer";
import { CategoryFilterBar } from "./CategoryFilterBar";

import { categoryApi } from "../api/category.api";

interface Category {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await categoryApi.getAll();

      if (result?.data) {
        setCategories(result.data);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load categories";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = async (category: Category) => {
    try {
      const data = await categoryApi.getById(category.id);

      setSelectedCategory(data.data);

      setIsDrawerOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load category";

      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    toast(
      "Are you sure you want to delete this category?",
      {
        action: {
          label: "Delete",
          onClick: async () => {
            try {
              await categoryApi.delete(id);

              setCategories((prev) =>
                prev.filter((c) => c.id !== id)
              );

              toast.success(
                "Category deleted successfully 🎉"
              );
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Failed to delete category";

              toast.error(message);
            }
          },
        },

        cancel: {
          label: "Cancel",
        },
      }
    );
  };

  const handleSubmit = async (data: Partial<Category>) => {
    try {
      if (selectedCategory) {
        await categoryApi.update(
          selectedCategory.id,
          data
        );
      } else {
        await categoryApi.create(data);
      }

      setIsDrawerOpen(false);

      toast.success(
        "Category saved successfully 🎉"
      );

      await fetchCategories();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save category";

      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-premium-bg p-6 lg:p-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <CategoryHeader
          total={categories.length}
          onAdd={handleAdd}
        />

        <section className="rounded-2xl border border-premium-border bg-white px-5 py-4 shadow-sm">
          <CategoryFilterBar />
        </section>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-4 border-premium-primary" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-600">
              {error}
            </div>
          ) : (
            <CategoryTable
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <CategoryDrawer
        key={selectedCategory?.id}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        category={selectedCategory}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}

