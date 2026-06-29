import { UnitConversionRepository } from "../repositories/unitconversion.repository";
import { CreateUnitConversionDTO, UpdateUnitConversionDTO } from "../dtos/unitconversion.dto";

export class UnitConversionService {
    private repository: UnitConversionRepository;

    constructor() {
        this.repository = new UnitConversionRepository();
    }

    async getConversions() {
        return await this.repository.findAll();
    }

    async getConversionById(id: string) {
        const unit = await this.repository.findById(id);
        if (!unit) {
            throw new Error(`Unit with ID ${id} not found`);
        }
        return unit;
    }

    async createConversion(data: CreateUnitConversionDTO) {
        if (!data.productId?.trim()) {
            throw new Error('productId is required');
        }
        if (!data.fromUnitId?.trim()) {
            throw new Error('fromUnitId is required');
        }
        if (!data.toUnitId?.trim()) {
            throw new Error('toUnitId is required');
        }
        if (!data.ratio) {
            throw new Error('ratio is required');
        }
        return await this.repository.create({
            productId: data.productId.trim(),
            fromUnitId: data.fromUnitId.trim(),
            toUnitId: data.toUnitId.trim(),
            ratio: data.ratio,
        });
    }

    async updateConversion(id: string, data: UpdateUnitConversionDTO) {
        if (data.productId !== undefined && !String(data.productId).trim()) {
            throw new Error('productId cannot be empty');
        }
        if (data.fromUnitId !== undefined && !String(data.fromUnitId).trim()) {
            throw new Error('fromUnitId cannot be empty');
        }
        if (data.toUnitId !== undefined && !String(data.toUnitId).trim()) {
            throw new Error('toUnitId cannot be empty');
        }
        if (data.ratio !== undefined && !data.ratio) {
            throw new Error('ratio cannot be empty');
        }

        // Ensure exists
        await this.getConversionById(id);

        return await this.repository.update(id, {
            ...(data.productId !== undefined && { productId: data.productId.trim() }),
            ...(data.fromUnitId !== undefined && { fromUnitId: data.fromUnitId.trim() }),
            ...(data.toUnitId !== undefined && { toUnitId: data.toUnitId.trim() }),
            ...(data.ratio !== undefined && { ratio: data.ratio }),
        });
    }

    async deleteConversion(id: string) {
        // Ensure exists
        await this.getConversionById(id);
        return await this.repository.delete(id);
    }
}

export const unitConversionService = new UnitConversionService();
