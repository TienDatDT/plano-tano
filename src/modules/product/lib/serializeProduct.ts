import type { ProductWithRelations } from "@/modules/product/repositories/product.repository";

export type ProductJson = Omit<ProductWithRelations, "variants"> & {
  variants: Array<
    Omit<ProductWithRelations["variants"][number], "salePrice" | "costPrice"> & {
      salePrice: number;
      costPrice: number | null;
      status: "ACTIVE" | "INACTIVE";
    }
  >;
};

export function serializeProduct(p: ProductWithRelations): ProductJson {
  return {
    ...p,
    variants: p.variants.map((v) => ({
      ...v,
      salePrice: Number(v.salePrice),
      costPrice: v.costPrice ? Number(v.costPrice) : null,
      status: v.status,
    })),
  };
}
