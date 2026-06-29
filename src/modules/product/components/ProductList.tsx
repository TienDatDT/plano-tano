"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ApiProduct = {
  id: string;
  name: string;
  description?: string | null;
  categoryId: string;
  category: { id: string; name: string };
  variants: Array<{ sku: string; salePrice: number; stock: number }>;
};

const priceFmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function ProductList() {

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json.data ?? json);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product and all variants?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        {"Loading catalog…"}</div>
    );
  }
  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-md">
        {"Error:"}{error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
        <span className="font-semibold">{"Admin workspace:"}</span> {"manage variants, SKUs, units, and stock in"}{" "}
        <Link href="/admin/products" className="font-bold underline underline-offset-2">
          {"Products &amp; variants"}</Link>
        .
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[2rem] border-2 border-violet-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-extrabold tracking-tight text-violet-900 flex items-center gap-3">
          <span className="text-3xl shadow-sm bg-violet-50 p-2 rounded-2xl">📦</span>
          {"Quick catalog"}</h2>
        <Link
          href="/products/new"
          className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-violet-200 transition-all font-bold text-sm flex items-center gap-2 justify-center"
        >
          <span className="text-lg bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">
            +
          </span>
          {"Add Product"}
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-[2rem] shadow-sm border-2 border-violet-100 p-3">
        <table className="min-w-full divide-y-2 divide-violet-50">
          <thead>
            <tr>
              <th className="px-6 py-5 text-left text-xs font-extrabold text-violet-600 uppercase tracking-wider rounded-tl-2xl">
                {"Product Name"}
              </th>
              <th className="px-6 py-5 text-left text-xs font-extrabold text-violet-600 uppercase tracking-wider">
                {"Category"}
              </th>
              <th className="px-6 py-5 text-left text-xs font-extrabold text-violet-600 uppercase tracking-wider">
                {"Variants"}</th>
              <th className="px-6 py-5 text-left text-xs font-extrabold text-violet-600 uppercase tracking-wider">
                {"From price"}</th>
              <th className="px-6 py-5 text-right text-xs font-extrabold text-violet-600 uppercase tracking-wider rounded-tr-2xl">
                {"Actions"}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-violet-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <span className="text-6xl mb-4 bg-violet-50 p-6 rounded-full">🛒</span>
                    <p className="text-xl font-bold text-violet-900">{"No products yet."}</p>
                    <p className="text-violet-500 text-base mt-2 font-medium">
                      {"Create one here or in the admin workspace."}</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const n = product.variants.length;
                const minPrice =
                  n === 0
                    ? null
                    : Math.min(...product.variants.map((v) => v.salePrice));
                return (
                  <tr key={product.id} className="hover:bg-violet-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-800 text-base">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border-2 border-emerald-200 shadow-sm">
                        {product.category?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {n} {"variant"}{n === 1 ? "" : "s"}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-800 font-extrabold">
                      {minPrice === null ? "—" : priceFmt.format(minPrice)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-bold space-x-2">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="text-violet-600 hover:text-violet-800 transition-colors px-4 py-2 hover:bg-violet-100 rounded-xl inline-block"
                      >
                        {"Edit"}</Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="text-rose-500 hover:text-rose-700 transition-colors px-4 py-2 hover:bg-rose-100 rounded-xl inline-block"
                      >
                        {"Delete"}</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
