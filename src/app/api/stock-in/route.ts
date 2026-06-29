import { stockInService } from "@/modules/stock-in/services/stock-in.service";
import { createResponse, createError } from "@/shared/lib/api-response";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const data = await stockInService.getStockIns();
    return createResponse(data);
  } catch (error: any) {
    return createError(error.message || "Failed to fetch stock receipts");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await stockInService.createStockIn(body);
    return createResponse(data, 201);
  } catch (error: any) {
    return createError(error.message || "Failed to create stock receipt");
  }
}
