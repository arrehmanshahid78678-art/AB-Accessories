import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, BadgePercent, Headphones } from "lucide-react";
import type { SiteSettings } from "@/lib/data";

export function Hero({ settings }: { settings: SiteSettings }) {
  const badges = [
    { icon: Truck, title: "Fast Delivery", desc: "Nationwide shipping" },
    { icon: ShieldCheck, title: "Genuine Products", desc: "100% authentic" },
    { icon: BadgePercent, title: "Best Prices", desc: "Unbeatable deals" },
    { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0 brand-gradient opacity-95" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            ⚡ New collection just dropped
          </span>
          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {settings.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-balance text-base text-white/80 sm:text-lg">
            {settings.heroSubtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              {settings.heroCtaText || "Shop Now"}
              <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/category/chargers"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Explore Categories
            </Link>
          </div>
        </div>

        <div className="relative animate-fade-up">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
            {settings.heroImage ? (
              <Image
                src={settings.heroImage}
                alt="AB Accessories premium mobile accessories"
                fill
                priority
                sizes="(max-width:1024px) 90vw, 45vw"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="absolute -bottom-4 -left-4 hidden rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-xl sm:block">
            <p className="text-2xl font-extrabold">10K+</p>
            <p className="text-xs text-slate-500">Happy customers</p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 lg:grid-cols-4">
          {badges.map((b) => (
            <div key={b.title} className="flex items-center gap-3 px-2 py-4 sm:px-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15">
                <b.icon size={18} />
              </span>
              <div>
                <p className="text-sm font-bold">{b.title}</p>
                <p className="text-xs text-white/70">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
