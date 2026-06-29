import { categoryService } from '@/modules/category/services/category.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const data = await request.json();
    const updated = await categoryService.updateCategory(params.id, data);
    return createResponse(updated);
  } catch (error: any) {
    return createError(error.message, 400);
  }
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const category = await categoryService.getCategoryById(params.id);

    if (!category) {
      return createError("Category is not found", 404);
    }
    return createResponse(category);
  } catch (error: any) {
    return createError(error.message, 500);
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await categoryService.deleteCategory(params.id);
    return createResponse({ success: true });
  } catch (error: any) {
    return createError(error.message, 400);
  }
}
