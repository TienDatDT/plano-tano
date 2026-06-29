// dtos/unitconversion.dto.ts

export interface CreateUnitConversionDTO {
  productId: string;
  fromUnitId: string;
  toUnitId: string;
  ratio: number; // ví dụ: 1.5 -> 1 đơn vị to = 1.5 đơn vị from
}

export interface UpdateUnitConversionDTO {
  productId?: string;
  fromUnitId?: string;
  toUnitId?: string;
  ratio?: number;
}