import { ShieldCheck, Truck, BadgePercent, Headphones } from "lucide-react";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSettings();
  const values = [
    { icon: ShieldCheck, title: "Genuine Products", text: "Every product is 100% authentic and quality-checked before shipping." },
    { icon: Truck, title: "Fast Delivery", text: "Quick nationwide dispatch with cash on delivery available." },
    { icon: BadgePercent, title: "Fair Prices", text: "Premium accessories at prices that make sense — no gimmicks." },
    { icon: Headphones, title: "Real Support", text: "Friendly, responsive help whenever you need it." },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <span className="text-xs font-bold uppercase tracking-widest text-brand-600">About Us</span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Premium accessories for everyday life
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        {settings.siteName} was founded with one simple goal — to make dependable, great-looking
        mobile accessories accessible to everyone. From fast chargers to wireless earbuds, we curate
        the best gear so you never have to compromise on quality or price.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <v.icon size={20} />
            </span>
            <h3 className="mt-3 font-bold text-slate-900">{v.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{v.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
