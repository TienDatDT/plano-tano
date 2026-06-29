import { prisma } from '@/shared/lib/prisma';
import { CreateSupplierDTO, UpdateSupplierDTO } from '../dtos/supplier.dto';


export class SupplierRepository {
  async findAll() {
    return await prisma.supplier.findMany({
      orderBy: { name: 'asc'}
    });
  }

  async findById(id: string) {
    return await prisma.supplier.findUnique({
      where: { id }
    });
  }

  async create(data: CreateSupplierDTO) {
    return await prisma.supplier.create({
      data: {
        name: data.name,
        representative: data.representative ?? null,
        address: data.address ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        status: data.status ?? true,
      },
    });
  }

  async update(id: string, data: UpdateSupplierDTO) {
    return await prisma.supplier.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.representative !== undefined && { representative: data.representative }),
        ...(data.contact !== undefined && { contact: data.contact }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
  }

  async delete(id: string) {
    return await prisma.supplier.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return await prisma.supplier.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
