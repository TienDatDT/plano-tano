import { UnitRepository } from "../repositories/unit.repository";
import { CreateUnitDTO, UpdateUnitDTO } from "../dtos/unit.dto";

export class UnitService {
    private repository: UnitRepository;

    constructor() {
        this.repository = new UnitRepository();
    }

    async getUnits() {
        return await this.repository.findAll();
    }

    async getUnitById(id: string) {
        const unit = await this.repository.findById(id);
        if (!unit) {
            throw new Error(`Unit with ID ${id} not found`);
        }
        return unit;
    }

    async createUnit(data: CreateUnitDTO) {
        if (!data.name?.trim()) {
            throw new Error('Unit name is required');
        }
        return await this.repository.create({
            name: data.name.trim(),
            symbol: data.symbol,
        });
    }

    async updateUnit(id: string, data: UpdateUnitDTO) {
        if (data.name !== undefined && !String(data.name).trim()) {
            throw new Error('Unit name cannot be empty');
        }

        // Ensure exists
        await this.getUnitById(id);

        return await this.repository.update(id, {
            ...(data.name !== undefined && { name: data.name.trim() }),
            symbol: data.symbol,
        });
    }

    async deleteUnit(id: string) {
        // Ensure exists
        await this.getUnitById(id);
        return await this.repository.delete(id);
    }
}

export const unitService = new UnitService();
