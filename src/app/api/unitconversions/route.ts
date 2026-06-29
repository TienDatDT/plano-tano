import { unitConversionService } from "@/modules/unitconversion/services/unitconversion.service";
import { createResponse, createError } from "@/shared/lib/api-response";

export async function GET() {
    try {
        const units = await unitConversionService.getConversions();
        return createResponse(units);
    } catch (error: any) {
        return createError(error.message, 500);
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const newUnit = await unitConversionService.createConversion(data);
        return createResponse(newUnit, 201);
    } catch (error: any) {
        return createError(error.message, 400);
    }
}
