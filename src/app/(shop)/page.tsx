import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { ProductGrid } from "@/components/site/ProductGrid";
import { ensureSeedData } from "@/lib/seed";
import {
  getCategories,
  getFeaturedProducts,
  getLatestProducts,
  getSettings,
  recordVisitor,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="group flex shrink-0 items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800"
        >
          {action.label}
          <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  try {
    await ensureSeedData();
  } catch (e) {
    console.error("seed error", e);
  }
  recordVisitor(crypto.randomUUID(), "/").catch(() => {});

  const [settings, categories, featured, latest] = await Promise.all([
    getSettings(),
    getCategories(),
    getFeaturedProducts(10),
    getLatestProducts(10),
  ]);

  return (
    <>
      <Hero settings={settings} />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading eyebrow="Browse" title="Shop by Category" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width:640px) 50vw, 16vw"
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
                <span className="absolute bottom-2 left-0 right-0 px-2 text-center text-xs font-bold text-white sm:text-sm">
                  {c.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <SectionHeading
            eyebrow="Handpicked"
            title="Featured Products"
            action={{ label: "View all", href: "/products" }}
          />
          <ProductGrid products={featured} currency={settings.currency} whatsapp={settings.whatsapp} />
        </section>
      )}

      {/* WhatsApp promo band */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-[#1f2c33] px-6 py-10 text-white sm:px-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#25D366]/20 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-extrabold sm:text-3xl">Prefer to order on WhatsApp?</h3>
              <p className="mt-1 text-white/70">
                Chat with us directly and we&apos;ll help you pick the perfect accessory.
              </p>
            </div>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "") || ""}?text=${encodeURIComponent("Hi AB Accessories!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
            >
              <MessageCircle size={18} /> Chat now
            </a>
          </div>
        </div>
      </section>

      {/* Latest */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <SectionHeading
            eyebrow="Just landed"
            title="Latest Arrivals"
            action={{ label: "View all", href: "/products" }}
          />
          <ProductGrid products={latest} currency={settings.currency} whatsapp={settings.whatsapp} />
        </section>
      )}
    </>
  );
}
