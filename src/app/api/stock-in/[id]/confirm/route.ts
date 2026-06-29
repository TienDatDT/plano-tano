import { stockInService } from "@/modules/stock-in/services/stock-in.service";
import { createResponse, createError } from "@/shared/lib/api-response";
import { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await stockInService.confirmStockIn(id);
    return createResponse(data);
  } catch (error: any) {
    return createError(error.message || "Failed to confirm stock receipt");
  }
}
