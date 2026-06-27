import { getSettings } from "@/lib/data";
import { CheckoutClient } from "@/components/site/CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">Checkout</h1>
      <CheckoutClient
        currency={settings.currency}
        shippingFee={settings.shippingFee}
        freeShipThreshold={settings.freeShippingThreshold}
        whatsapp={settings.whatsapp}
      />
    </div>
  );
}
