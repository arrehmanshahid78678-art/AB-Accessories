"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, Phone, ChevronRight } from "lucide-react";
import type { Category, SiteSettings } from "@/lib/data";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";

export function Navbar({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  const router = useRouter();
  const { count, setOpen } = useCart();
  const [q, setQ] = useState("");
  const [mobile, setMobile] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
    setMobile(false);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* announcement bar */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[11px] sm:text-xs">
          <span className="flex items-center gap-1.5">
            <span className="hidden sm:inline">🚚</span>
            Free delivery on orders over{" "}
            {formatPrice(settings.freeShippingThreshold, settings.currency)}
          </span>
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center gap-1.5 font-medium hover:text-brand-300"
          >
            <Phone size={12} /> {settings.phone}
          </a>
        </div>
      </div>

      {/* main bar */}
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button
            className="rounded-lg p-1.5 text-slate-700 lg:hidden"
            onClick={() => setMobile(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="flex items-center gap-2">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings.logoText}
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-cover"
              />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-xl brand-gradient text-sm font-black text-white shadow">
                AB
              </span>
            )}
            <span className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
              {settings.logoText}
            </span>
          </Link>

          <form onSubmit={submit} className="mx-auto hidden w-full max-w-md md:block">
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-brand-400 focus-within:bg-white">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search chargers, earbuds, power banks…"
                className="w-full bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="grid h-10 w-12 place-items-center text-slate-500 hover:text-brand-600"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-700 lg:flex">
            <Link href="/products" className="hover:text-brand-600">
              Shop All
            </Link>
            {categories.slice(0, 3).map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="hover:text-brand-600">
                {c.name}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="relative ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 transition hover:border-brand-300 hover:text-brand-600 lg:ml-0"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full brand-gradient px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>

        {/* mobile search */}
        <div className="border-t border-slate-100 px-4 py-2 md:hidden">
          <form onSubmit={submit}>
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-transparent px-4 py-2.5 text-sm outline-none"
              />
              <button type="submit" className="grid h-10 w-12 place-items-center text-slate-500" aria-label="Search">
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* category strip */}
        <div className="hidden border-t border-slate-100 lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 no-scrollbar">
            <Link
              href="/products"
              className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              All Products
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* mobile menu */}
      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 animate-fade-in" onClick={() => setMobile(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-5 shadow-2xl animate-slide-in">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-extrabold">Menu</span>
              <button onClick={() => setMobile(false)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col">
              <MobileLink href="/" label="Home" onClick={() => setMobile(false)} />
              <MobileLink href="/products" label="Shop All Products" onClick={() => setMobile(false)} />
              <div className="px-1 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Categories
              </div>
              {categories.map((c) => (
                <MobileLink
                  key={c.id}
                  href={`/category/${c.slug}`}
                  label={c.name}
                  onClick={() => setMobile(false)}
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      {label}
      <ChevronRight size={16} className="text-slate-400" />
    </Link>
  );
}
