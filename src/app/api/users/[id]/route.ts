import { NextRequest } from "next/server";
import { userService } from "@/modules/users/services/user.service";
import { createResponse, createError } from "@/shared/lib/api-response";
import { withRoleGuard } from "@/modules/auth/guards/role.guard";

export const PATCH = withRoleGuard(["ADMIN"], async (req, session) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const id = pathParts[pathParts.length - 1];
  
  const body = await req.json();
  
  try {
    const updated = await userService.updateUser(id, session.id, body);
    return createResponse(updated);
  } catch (error: any) {
    return createError(error.message, 400);
  }
});
