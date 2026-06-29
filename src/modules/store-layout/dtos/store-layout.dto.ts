// dtos/store-layout.dto.ts

export interface CreateStoreLayoutDTO {
  name: string;
  width: number;
  height: number;
  isActive?: boolean;
}

export interface UpdateStoreLayoutDTO {
  name?: string;
  width?: number;
  height?: number;
  isActive?: boolean;
}

export interface StoreLayoutFilterDTO {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface StoreLayoutResponseDTO {
  id: string;
  name: string;
  width: number;
  height: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  shelfCount?: number;
}

export interface StoreLayoutDetailDTO extends StoreLayoutResponseDTO {
  shelves: ShelfInLayoutDTO[];
}

export interface ShelfInLayoutDTO {
  id: string;
  name: string;
  description: string | null;
  layoutId: string;
  posX: number;
  posY: number;
  layoutType: string;
  width: number | null;
  height: number | null;
  rows: number | null;
  columns: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedStoreLayoutDTO {
  data: StoreLayoutResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}