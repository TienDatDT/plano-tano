"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProductFormProps {
  productId?: string;
}

interface Category {
  id: string;
  name: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  useEffect(() => {
    const initForm = async () => {
      try {
        const catRes = await fetch("/api/categories");
        if (!catRes.ok) throw new Error("Failed to load categories");
        const catsRaw = await catRes.json();
        const cats = catsRaw.success ? catsRaw.data : catsRaw;
        setCategories(cats);

        if (cats.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
        }

        if (isEditing && productId) {
          const prodRes = await fetch(`/api/products/${productId}`);
          if (!prodRes.ok) throw new Error("Failed to load product");
          const p = await prodRes.json();

          setFormData({
            name: p.name,
            description: p.description || "",
            categoryId: p.categoryId,
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Load error");
      } finally {
        setLoading(false);
      }
    };

    initForm();
  }, [productId, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.name.trim() || !formData.categoryId) {
      setError("Name and category are required.");
      setSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      categoryId: formData.categoryId,
    };

    try {
      const url = isEditing ? `/api/products/${productId}` : `/api/products`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-[2rem] shadow-lg border-2 border-violet-100 space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
        {"SKUs, pricing, and stock live on"}{" "}
        <Link href="/admin/products" className="font-bold underline underline-offset-2">
          {"variants in the admin workspace"}</Link>
        {". This form only edits the product record (name, description, category)."}</div>

      <div className="border-b-2 border-violet-50 pb-6 text-center">
        <h2 className="text-3xl font-extrabold text-violet-900 tracking-tight">
          {isEditing ? "Edit product" : "New product"}
        </h2>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-200 p-4 text-rose-700 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
        <div className="space-y-2">
          <label className="text-sm font-extrabold text-violet-900 ml-1">
            {"Name"}<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-violet-100 focus:border-violet-400 outline-none font-bold text-slate-800"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-extrabold text-violet-900 ml-1">{"Category *"}</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold"
            required
            disabled={categories.length === 0}
          >
            {categories.length === 0 && <option value="">{"No categories"}</option>}
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-extrabold text-violet-900 ml-1">{"Description"}</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl resize-none font-bold text-slate-800"
          />
        </div>

        <div className="flex items-center justify-end space-x-4 pt-8 border-t-2 border-violet-50">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="px-6 py-3.5 font-extrabold text-sm text-slate-600 bg-white border-2 border-slate-200 rounded-2xl"
          >
            {"Cancel"}</button>
          <button
            type="submit"
            disabled={submitting || categories.length === 0}
            className="px-8 py-3.5 font-extrabold text-sm text-white bg-violet-500 rounded-2xl hover:bg-violet-600 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
