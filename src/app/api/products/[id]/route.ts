import { productService } from '@/modules/product/services/product.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const data = await request.json();
    const updated = await productService.updateProduct(params.id, data);
    return createResponse(updated);
  } catch (error: any) {
    return createError(error.message, 400);
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const data = await request.json();
    const updated = await productService.updateProduct(params.id, data);
    return createResponse(updated);
  } catch (error: any) {
    return createError(error.message, 400);
  }
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const product = await productService.getProductById(params.id);

    if (!product) {
      return createError("Product is not found", 404);
    }
    return createResponse(product);
  } catch (error: any) {
    return createError(error.message, 500);
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await productService.deleteProduct(params.id);
    return createResponse({ success: true });
  } catch (error: any) {
    return createError(error.message, 400);
  }
}
