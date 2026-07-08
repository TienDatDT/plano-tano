import { prisma } from '@/shared/lib/prisma';
import { AuthUser, LoginFormValues } from '../types';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession, decrypt } from '@/shared/lib/session';
import { cookies } from 'next/headers';

class AuthService {
  async signIn(values: LoginFormValues) {
    const { identifier, password } = values;

    // Tìm user theo username hoặc email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: {
        profile: true
      }
    });

    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    if (!user.isActive) {
      throw new Error('Tài khoản của bạn đã bị vô hiệu hóa.');
    }

    let profile = user.profile;

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          id: user.id, // Keep the same ID for the profile as the user for 1:1, or use userId
          userId: user.id,
          // email: user.email,
          role: 'STAFF', 
        }
      });
    } else if (!profile) { // Actually isActive is on User, maybe role is on profile
      // If there's additional check needed for profile, we can do it here
    }

    // Cập nhật last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Tạo session cookie (3 ngày)
    await createSession(user.id, profile.role);

    return { user };
  }

  async signOut() {
    deleteSession();
  }

  async getServerSession(): Promise<AuthUser | null> {
    const cookieStore = cookies();
    const sessionCookie = (await cookieStore).get('session')?.value;
    
    const payload = await decrypt(sessionCookie);

    if (!payload || !payload.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true }
    });

    if (!user || !user.isActive) {
      return null;
    }

    const profile = user.profile;
    
    return {
      id: user.id,
      email: user.email,
      fullName: profile?.fullName || null,
      role: profile?.role || 'STAFF',
      avatarUrl: profile?.avatarUrl || null,
    };
  }
}

export const authService = new AuthService();
