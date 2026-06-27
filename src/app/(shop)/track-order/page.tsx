import Link from "next/link";
import { PackageSearch, MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage() {
  const settings = await getSettings();
  const waNumber = settings.whatsapp ? settings.whatsapp.replace(/\D/g, "") : "";
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <PackageSearch size={30} />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Track Your Order</h1>
      <p className="mt-3 text-slate-600">
        For real-time order updates, message us on WhatsApp with your order number and we&apos;ll get
        back to you right away.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I'd like to track my order #____")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:brightness-95"
        >
          <MessageCircle size={18} /> Track on WhatsApp
        </a>
        <Link href="/products" className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
