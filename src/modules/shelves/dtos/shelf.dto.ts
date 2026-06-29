// dtos/shelf.dto.ts

export type ShelfLayoutType = 'DIMENSION' | 'GRID';

export interface CreateShelfDTO {
  name?: string;
  templateId: string;
  layoutId?: string;
  posX?: number;
  posY?: number;
  rotation?: number;
}

export interface UpdateShelfDTO {
  name?: string;
  description?: string;
  posX?: number;
  posY?: number;
  rotation?: number;
  templateId?: string;
  layoutId?: string;
}

export interface ShelfFilterDTO {
  search?: string;
  layoutId?: string;
  layoutType?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'posX' | 'posY';
  sortOrder?: 'asc' | 'desc';
}

export interface ShelfResponseDTO {
  id: string;
  name: string;
  description: string | null;
  layoutId: string;
  posX: number;
  posY: number;
  rotation: number;
  layoutType: ShelfLayoutType;
  width: number | null;
  height: number | null;
  rows: number | null;
  columns: number | null;
  createdAt: Date;
  updatedAt: Date;
  cellCount?: number;
  itemCount?: number;
}

export interface ShelfDetailDTO extends ShelfResponseDTO {
  layout: {
    id: string;
    name: string;
    width: number;
    height: number;
  };
  cells: ShelfCellDTO[];
  items: ShelfItemResponseDTO[];
}

export interface ShelfCellDTO {
  id: string;
  shelfId: string;
  row: number;
  column: number;
}

export interface CreateShelfCellDTO {
  row: number;
  column: number;
}

export interface ShelfItemResponseDTO {
  id: string;
  shelfId: string;
  batchId: string;
  cellId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  batch?: {
    id: string;
    lotNumber: string;
    variant: {
      id: string;
      sku: string;
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
  cell?: ShelfCellDTO;
}

export interface PaginatedShelfDTO {
  data: ShelfResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
