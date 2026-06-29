import { categoryService } from '@/modules/category/services/category.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET() {
  try {
    const categories = await categoryService.getCategories();
    return createResponse(categories);
  } catch (error: any) {
    return createError(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newCategory = await categoryService.createCategory(data);
    return createResponse(newCategory, 201);
  } catch (error: any) {
    return createError(error.message, 400);
  }
}
