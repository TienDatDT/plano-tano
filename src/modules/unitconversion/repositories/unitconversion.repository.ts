import { prisma } from "@/shared/lib/prisma";
import { CreateUnitConversionDTO, UpdateUnitConversionDTO } from "../dtos/unitconversion.dto";

export class UnitConversionRepository {
    async create(data: CreateUnitConversionDTO) {
        return await prisma.unitConversion.create({
            data: {
                ratio: data.ratio,
                fromUnitId: data.fromUnitId,
                toUnitId: data.toUnitId,
                productId: data.productId,
            },
        });
    }

    async findAll() {
        return await prisma.unitConversion.findMany({
            include: {
                product: true,
                fromUnit: true,
                toUnit: true
            }
        });
    }

    async findById(id: string) {
    return await prisma.unitConversion.findUnique({
        where: { id },
        include: {
            product: true,
            fromUnit: true,
            toUnit: true,
        },
    });
}

async update(id: string, data: UpdateUnitConversionDTO) {
    return await prisma.unitConversion.update({
        where: { id },
        data: {
            ratio: data.ratio,
            productId: data.productId,
            fromUnitId: data.fromUnitId,
            toUnitId: data.toUnitId,
        },
    });
}

    async delete(id: string) {
        return await prisma.unitConversion.delete({
            where: { id },
        });
    }
}
