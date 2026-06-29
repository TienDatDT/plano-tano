import { stockInService } from "@/modules/stock-in/services/stock-in.service";
import { createResponse, createError } from "@/shared/lib/api-response";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await stockInService.getStockInById(id);
    if (!data) {
      return createError("Stock receipt not found", 404);
    }
    return createResponse(data);
  } catch (error) {
    return createError(error as string);
  }
}
