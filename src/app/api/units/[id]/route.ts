import { unitService } from "@/modules/unit/services/unit.service";
import { createResponse, createError } from "@/shared/lib/api-response";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const data = await request.json();
        const updated = await unitService.updateUnit(params.id, data);
        return createResponse(updated);
    } catch (error: any) {
        return createError(error.message, 400);
    }
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const unit = await unitService.getUnitById(params.id);
        return createResponse(unit);
    } catch (error: any) {
        return createError(error.message, 500);
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const deleted = await unitService.deleteUnit(params.id);
        return createResponse(deleted);
    } catch (error: any) {
        return createError(error.message, 400);
    }
}
