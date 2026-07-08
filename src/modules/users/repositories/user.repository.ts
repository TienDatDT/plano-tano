import { prisma } from "@/shared/lib/prisma";
import { UserRole } from "@/modules/auth/types";
import { UpdateUserDto } from "../types";

class UserRepository {
  async findMany(query?: string, role?: UserRole, isActive?: boolean) {
    const where: any = {};
    if (query) {
      where.OR = [
        { fullName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = role;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return prisma.userProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.userProfile.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return prisma.userProfile.update({
      where: { id },
      data,
    });
  }

  async create(data: { id: string; email: string; role: UserRole; fullName?: string }) {
    return prisma.userProfile.create({
      data,
    });
  }
}

export const userRepository = new UserRepository();
