import { categoryService } from '@/modules/category/services/category.service';
import { createResponse } from '@/shared/lib/api-response';
import { withRoleGuard } from '@/modules/auth/guards/role.guard';

export const GET = withRoleGuard(['ADMIN', 'STAFF', 'VIEWER'], async () => {
  const categories = await categoryService.getCategories();
  return createResponse(categories);
});

export const POST = withRoleGuard(['ADMIN'], async (request) => {
  const data = await request.json();
  const newCategory = await categoryService.createCategory(data);
  return createResponse(newCategory, 201);
});
