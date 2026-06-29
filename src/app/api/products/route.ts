import { productService } from "@/modules/product/services/product.service";
import { createResponse, createError } from "@/shared/lib/api-response";

export async function GET() {
    try {
        const products = await productService.getAllProducts();
        return createResponse(products);
    } catch (error: any) {
        return createError(error.message, 500);
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const newProduct = await productService.createProduct(data);
        return createResponse(newProduct, 201);
    } catch (error: any) {
        return createError(error.message, 400);
    }
}

export async function DELETE(request: Request) {
    try {
        const { ids } = await request.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            return createError('ids must be a non-empty array', 400);
        }
        const result = await productService.deleteProducts(ids);
        return createResponse(result);
    } catch (error: any) {
        return createError(error.message, 400);
    }
}

export async function PATCH(request: Request) {
    try {
        const { ids, status } = await request.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            return createError('ids must be a non-empty array', 400);
        }
        if (status !== 'ACTIVE' && status !== 'INACTIVE') {
            return createError('Invalid status value', 400);
        }
        const result = await productService.updateProductsStatus(ids, status);
        return createResponse(result);
    } catch (error: any) {
        return createError(error.message, 400);
    }
}
