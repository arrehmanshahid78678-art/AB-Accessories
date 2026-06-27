import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();
  const waNumber = settings.whatsapp ? settings.whatsapp.replace(/\D/g, "") : "";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi AB Accessories!")}`;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Contact</span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Get in touch</h1>
      <p className="mt-3 text-slate-600">
        Have a question about a product or your order? We&apos;re here to help — reach us any way you like.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a href={`tel:${settings.phone}`} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-300">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Phone size={20} /></span>
          <div><p className="text-sm font-bold text-slate-900">Phone</p><p className="text-sm text-slate-500">{settings.phone}</p></div>
        </a>
        <a href={`mailto:${settings.email}`} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-300">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Mail size={20} /></span>
          <div><p className="text-sm font-bold text-slate-900">Email</p><p className="text-sm text-slate-500">{settings.email}</p></div>
        </a>
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-300">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><MessageCircle size={20} /></span>
          <div><p className="text-sm font-bold text-slate-900">WhatsApp</p><p className="text-sm text-slate-500">Chat with us instantly</p></div>
        </a>
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><MapPin size={20} /></span>
          <div><p className="text-sm font-bold text-slate-900">Address</p><p className="text-sm text-slate-500">{settings.address}</p></div>
        </div>
      </div>
    </div>
  );
}
