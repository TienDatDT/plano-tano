// dtos/planogram.dto.ts

export interface AssignItemDTO {
  shelfId: string;
  cellId: string;
  batchId: string;
  quantity: number;
}

export interface UpdateItemDTO {
  batchId?: string;
  quantity?: number;
  cellId?: string;
}

export interface PlanogramFilterDTO {
  shelfId?: string;
  layoutId?: string;
  batchId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'quantity';
  sortOrder?: 'asc' | 'desc';
}

export interface PlanogramItemResponseDTO {
  id: string;
  shelfId: string;
  cellId: string;
  batchId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  shelf?: {
    id: string;
    name: string;
    layoutId: string;
    posX: number;
    posY: number;
  };
  cell?: {
    id: string;
    row: number;
    column: number;
  };
  batch?: {
    id: string;
    lotNumber: string;
    expDate: Date | null;
    mfgDate: Date | null;
    variant: {
      id: string;
      sku: string;
      salePrice: number;
      product: {
        id: string;
        name: string;
        imageUrl: string | null;
      };
      unit: {
        id: string;
        name: string;
        symbol: string | null;
      };
    };
  };
}

export interface BulkAssignItemDTO {
  items: AssignItemDTO[];
}

export interface PlanogramSnapshotDTO {
  layoutId: string;
  shelves: {
    shelfId: string;
    shelfName: string;
    cells: {
      cellId: string;
      row: number;
      column: number;
      item: PlanogramItemResponseDTO | null;
    }[];
  }[];
}

export interface PaginatedPlanogramDTO {
  data: PlanogramItemResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
