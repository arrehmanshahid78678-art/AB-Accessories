import { getOrders } from "@/lib/data";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getOrders(100);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">{orders.length} orders</p>
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}
