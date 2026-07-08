import { UserRole } from '@/generated/prisma';
import { z } from 'zod';

export type { UserRole };

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
}

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Tên đăng nhập hoặc Email không được để trống'),
  password: z.string().min(3, 'Mật khẩu phải có ít nhất 3 ký tự'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
