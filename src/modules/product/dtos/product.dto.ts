export interface CreateProductDTO {
  name: string;
  description?: string | null;
  categoryId: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateProductDTO {
  name?: string;
  description?: string | null;
  categoryId?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface CreateVariantDTO {
  sku: string;
  salePrice: number;
  unitId: string;
  costPrice?: number | null;
  status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateVariantDTO {
  sku?: string;
  salePrice?: number;
  unitId?: string;
  costPrice?: number | null;
  status?: "ACTIVE" | "INACTIVE";
}
