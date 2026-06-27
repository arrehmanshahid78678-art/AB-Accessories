import { getSettings } from "@/lib/data";
import { CartView } from "@/components/site/CartView";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">Shopping Cart</h1>
      <CartView
        currency={settings.currency}
        shippingFee={settings.shippingFee}
        freeShipThreshold={settings.freeShippingThreshold}
      />
    </div>
  );
}
