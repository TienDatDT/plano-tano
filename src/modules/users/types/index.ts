import { UserRole } from "@/modules/auth/types";
import { z } from "zod";

export interface UserRow {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export const inviteUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
  fullName: z.string().optional(),
});

export type InviteUserDto = z.infer<typeof inviteUserSchema>;

export const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
