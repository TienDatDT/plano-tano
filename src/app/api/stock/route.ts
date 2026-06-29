import { stockService } from "@/modules/stock/services/stock.service";
import { createResponse, createError } from "@/shared/lib/api-response";

export async function GET() {
  try {
    const data = await stockService.getStockSummary();
    return createResponse(data);
  } catch (error) {
    return createError(error);
  }
}
