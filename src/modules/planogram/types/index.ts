export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  variantName?: string;
  stock: number;
  price: number;
  imageUrl?: string;
  category?: string;
  batches?: { id: string; quantity: number; lotNumber: string }[];
}

export interface Shelf {
  id: string;
  name: string;
  columns: number;
  rows: number;
  posX: number;
  posY: number;
  rotation: number;
  templateId?: string;
  template?: {
    layoutType: string;
    width: number | null;
    height: number | null;
  };
  cells?: { id: string; row: number; column: number }[];
}

export interface ShelfItem {
  id: string;
  shelfId: string;
  variantId: string;
  batchId: string;
  cellId: string;
  positionX: number;
  positionY: number;
  quantity?: number;
  // Join data for UI
  variant?: ProductVariant;
}

export interface PlanogramState {
  items: ShelfItem[];
  selectedItemId: string | null;
}
