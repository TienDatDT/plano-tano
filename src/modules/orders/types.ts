export type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  variantName: string; // Including for UI display
  quantity: number;
  salePrice: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}
