import { NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const existingUsers = await prisma.user.count();

    if (existingUsers > 0) {
      return NextResponse.json(
        { message: 'Hệ thống đã có người dùng, không thể chạy setup.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash('admin', 10);

    const user = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@tanaplano.com',
        passwordHash,
        profile: {
          create: {
            fullName: 'Admin User',
            role: 'ADMIN',
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Đã tạo tài khoản admin thành công!',
      username: user.username,
      email: user.email,
      password: 'admin'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Lỗi khi tạo user: ' + error.message },
      { status: 500 }
    );
  }
}
