import { stockRepository } from "../repositories/stock.repository";

export class StockService {
  async getStockSummary() {
    return await stockRepository.getVariantStockSummary();
  }
}

export const stockService = new StockService();
