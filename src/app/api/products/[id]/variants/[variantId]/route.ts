import { variantService } from '@/modules/product/services/variant.service';
import { createResponse, createError } from '@/shared/lib/api-response';

function statusFromError(message: string): number {
  if (message.includes('not found')) return 404;
  if (message.includes('SKU already')) return 409;
  return 400;
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { id: productId, variantId } = await props.params;
    const body = await request.json();

    const variant = await variantService.updateVariant(
      productId,
      variantId,
      body
    );

    return createResponse(variant);
  } catch (error: any) {
    return createError(error.message, statusFromError(error.message));
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { id: productId, variantId } = await props.params;

    await variantService.deleteVariant(productId, variantId);

    return createResponse(null, 204); // chuẩn hóa luôn
  } catch (error: any) {
    return createError(error.message, statusFromError(error.message));
  }
}
