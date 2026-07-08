import { CategoryManagement } from "@/modules/category/components/CategoryManagemnet";
import { requireRole } from "@/modules/auth/guards/role.guard";

export default async function CategoriesPage() {
  await requireRole(['ADMIN']);
  return <CategoryManagement />;
}
