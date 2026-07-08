import { NextRequest } from "next/server";
import { userService } from "@/modules/users/services/user.service";
import { createResponse } from "@/shared/lib/api-response";
import { withRoleGuard } from "@/modules/auth/guards/role.guard";
import { UserRole } from "@/modules/auth/types";

export const GET = withRoleGuard(["ADMIN"], async (req) => {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || undefined;
  const role = searchParams.get("role") as UserRole | undefined;
  
  let isActive: boolean | undefined;
  const statusStr = searchParams.get("status");
  if (statusStr === "active") isActive = true;
  if (statusStr === "inactive") isActive = false;

  const users = await userService.getUsers(query, role, isActive);
  return createResponse(users);
});

export const POST = withRoleGuard(["ADMIN"], async (req) => {
  const body = await req.json();
  const user = await userService.inviteUser(body);
  return createResponse(user, 201);
});
