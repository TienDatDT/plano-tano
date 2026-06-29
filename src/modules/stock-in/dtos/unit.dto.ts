// dtos/unit.dto.ts

export interface CreateUnitDTO {
  name: string;
  symbol?: string;
}

export interface UpdateUnitDTO {
  name?: string;
  symbol?: string;
}

