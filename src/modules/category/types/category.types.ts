export interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormValues {
  name: string;
  description: string | null;
}
