import { prisma } from "@/shared/lib/prisma";
import { CreateUnitDTO, UpdateUnitDTO } from "../dtos/unit.dto";

export class UnitRepository {
    async create(data: CreateUnitDTO) {
        return await prisma.unit.create({
            data,
        });
    }

    async findAll() {
        return await prisma.unit.findMany();
    }

    async findById(id: string) {
        return await prisma.unit.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: UpdateUnitDTO) {
        return await prisma.unit.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return await prisma.unit.delete({
            where: { id },
        });
    }
}
