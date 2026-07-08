import { requireRole } from "@/modules/auth/guards/role.guard";
import { UserManagement } from "@/modules/users/components/UserManagement";

export default async function UsersPage() {
  await requireRole(['ADMIN']);
  return <UserManagement />;
}
