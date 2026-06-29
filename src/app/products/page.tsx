import { ProductList } from '@/modules/product/components/ProductList';
import { Link } from 'lucide-react';

export const metadata = {
  title: 'Catalog | Pos System',
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans flex flex-col">
      <div className="max-w-7xl mx-auto w-full mb-8 flex justify-between items-center">
        <Link href="/" className="text-violet-500 font-extrabold hover:text-violet-700 flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border-2 border-violet-100 transition-all hover:-translate-x-1">
          <span className="text-xl">🔙</span> {"Back Home"}</Link>
        <Link
          href="/admin/products"
          className="bg-emerald-100 text-emerald-900 font-extrabold px-6 py-2 rounded-full border-2 border-emerald-200 shadow-sm hover:bg-emerald-200 transition-colors"
        >
          {"Open admin workspace"}</Link>
      </div>
      <div className="max-w-7xl mx-auto w-full">
        <ProductList />
      </div>
    </main>
  );
}
