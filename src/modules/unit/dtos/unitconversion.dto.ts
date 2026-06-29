export interface CreateUnitConversionDTO {
    productId: string;
    fromUnitId: string;
    toUnitId: string;
    ratio: number;
}

export interface UpdateUnitConversionDTO {
    productId?: string;
    fromUnitId?: string;
    toUnitId?: string;
    ratio?: number;
}
