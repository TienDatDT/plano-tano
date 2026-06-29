import { ProductVariantWorkspace } from "@/modules/product/components/ProductVariantWorkspace";

export const metadata = {
  title: "Products & variants | TanaPlano Admin",
};

export default function AdminProductsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <ProductVariantWorkspace />
    </div>
  );
}
