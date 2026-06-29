import { variantService } from '@/modules/product/services/variant.service';
import { createResponse, createError } from '@/shared/lib/api-response';

function statusFromError(message: string): number {
  if (message === 'Product not found') return 404;
  if (message.includes('SKU already')) return 409;
  return 400;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const variant = await variantService.createVariant(productId, body);
    return createResponse(variant, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createError(
      message,
      statusFromError(message),
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await props.params;
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return createError('ids must be a non-empty array', 400);
    }
    const result = await variantService.deleteVariants(productId, ids);
    return createResponse(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createError(message, statusFromError(message));
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await props.params;
    const { ids, status, salePrice } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return createError('ids must be a non-empty array', 400);
    }

    let result;
    if (status !== undefined) {
      if (status !== 'ACTIVE' && status !== 'INACTIVE') {
        return createError('Invalid status value', 400);
      }
      result = await variantService.updateVariantsStatus(productId, ids, status);
    } else if (salePrice !== undefined) {
      const priceVal = parseFloat(salePrice);
      if (isNaN(priceVal) || priceVal < 0) {
        return createError('Invalid price value', 400);
      }
      result = await variantService.updateVariantsPrice(productId, ids, priceVal);
    } else {
      return createError('No fields to update provided', 400);
    }

    return createResponse(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createError(message, statusFromError(message));
  }
}
