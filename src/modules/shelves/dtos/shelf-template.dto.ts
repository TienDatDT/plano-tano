// shelf-template.dto.ts

import { ShelfLayoutType } from "./shelf.dto";

export interface ShelfTemplate {
  id: string;
  name: string;
  description: string | null;
  layoutType: ShelfLayoutType;
  width?: number;
  height?: number;
  rows?: number;
  columns?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CreateShelfTemplateDTO {
  name: string;

  description?: string;

  layoutType: ShelfLayoutType;

  width?: number;
  height?: number;

  rows?: number;
  columns?: number;
}

export interface UpdateShelfTemplateDTO {
  name?: string;

  description?: string;

  layoutType?: ShelfLayoutType;

  width?: number;
  height?: number;

  rows?: number;
  columns?: number;
}

export interface ShelfTemplateFilterDTO {
  search?: string;

  layoutType?: ShelfLayoutType;

  page?: number;
  limit?: number;

  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}