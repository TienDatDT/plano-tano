import { OrderList } from "@/modules/orders/components/OrderList";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{"Order Management"}</h1>
        <p className="mt-2 text-sm text-premium-muted">
          {"View and manage customer orders and track fulfillment status."}</p>
      </div>

      <OrderList />
    </div>
  );
}
