import { userRepository } from "../repositories/user.repository";
import { InviteUserDto, UpdateUserDto } from "../types";
import { createSupabaseAdminClient } from "@/shared/lib/supabase/server";
import { UserRole } from "@/modules/auth/types";

class UserService {
  async getUsers(query?: string, role?: UserRole, isActive?: boolean) {
    return userRepository.findMany(query, role, isActive);
  }

  async inviteUser(data: InviteUserDto) {
    const supabaseAdmin = await createSupabaseAdminClient();
    
    // Invite using Supabase Auth
    const { data: inviteData, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: {
        role: data.role,
        fullName: data.fullName,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Email này đã được đăng ký trong hệ thống.');
      }
      throw error;
    }

    if (!inviteData.user) {
      throw new Error("Không thể tạo người dùng mới.");
    }

    // Check if profile exists (maybe it was soft-deleted before)
    let profile = await userRepository.findById(inviteData.user.id);
    
    if (!profile) {
      profile = await userRepository.create({
        id: inviteData.user.id,
        email: data.email,
        role: data.role,
        fullName: data.fullName,
      });
    } else {
      profile = await userRepository.update(inviteData.user.id, {
        role: data.role,
        isActive: true,
      });
    }

    return profile;
  }

  async updateUser(targetId: string, currentUserId: string, data: UpdateUserDto) {
    const targetUser = await userRepository.findById(targetId);
    if (!targetUser) throw new Error("Không tìm thấy người dùng.");

    // Validate logic
    if (targetId === currentUserId && data.role && data.role !== "ADMIN" && targetUser.role === "ADMIN") {
      throw new Error("Bạn không thể tự hạ quyền Admin của chính mình.");
    }

    if (targetId === currentUserId && data.isActive === false) {
      throw new Error("Bạn không thể tự vô hiệu hóa tài khoản của chính mình.");
    }

    return userRepository.update(targetId, data);
  }
}

export const userService = new UserService();
