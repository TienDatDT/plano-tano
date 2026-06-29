import { ProductForm } from '@/modules/product/components/ProductForm';

export const metadata = {
  title: 'New Product | Pos System',
};

export default function NewProductPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <ProductForm />
      </div>
    </main>
  );
}
