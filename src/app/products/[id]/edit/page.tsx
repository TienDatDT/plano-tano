import { ProductForm } from '@/modules/product/components/ProductForm';

export const metadata = {
  title: 'Edit Product | Pos System',
};

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <ProductForm productId={id} />
      </div>
    </main>
  );
}
