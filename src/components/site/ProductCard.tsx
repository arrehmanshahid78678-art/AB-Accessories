"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Eye, MessageCircle } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/components/cart/CartProvider";
import { cn, discountPercent, effectivePrice, formatPrice } from "@/lib/utils";
import { RatingStars } from "@/components/site/RatingStars";
import { QuickViewModal } from "@/components/site/QuickViewModal";

export function ProductCard({
  product,
  currency,
  whatsapp,
}: {
  product: Product;
  currency: string;
  whatsapp: string;
}) {
  const { addItem } = useCart();
  const [quick, setQuick] = useState(false);

  const image = product.images[0] ?? "/images/placeholder.svg";
  const price = effectivePrice(product.price, product.salePrice);
  const off = discountPercent(product.price, product.salePrice);
  const out = product.stock <= 0;

  const waText = encodeURIComponent(
    `Hi AB Accessories! I'd like to order:\n*${product.title}*\nPrice: ${formatPrice(price, currency)}`,
  );
  const waNumber = whatsapp ? whatsapp.replace(/\D/g, "") : "";
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  const handleAdd = () => {
    if (out) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.images[0] ?? null,
      price: product.price,
      salePrice: product.salePrice,
      stock: product.stock,
    });
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-slate-200/70">
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-square overflow-hidden bg-slate-50"
        >
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 20vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          {off != null && (
            <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm">
              -{off}%
            </span>
          )}
          {product.featured && (
            <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-amber-950 shadow-sm">
              ★ Top
            </span>
          )}
          {out && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-bold text-slate-700">
              Out of stock
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setQuick(true);
            }}
            className="absolute bottom-2 left-1/2 flex -translate-x-1/2 translate-y-3 items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Eye size={14} /> Quick view
          </button>
        </Link>

        <div className="flex flex-1 flex-col gap-1 p-3">
          {product.brand && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
              {product.brand}
            </span>
          )}
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 min-h-[2.4rem] text-[13px] font-semibold leading-snug text-slate-800 transition hover:text-brand-700"
          >
            {product.title}
          </Link>
          <RatingStars rating={product.rating} count={product.reviewCount} />

          <div className="mt-auto flex items-end gap-1.5 pt-1.5">
            <span className="text-base font-extrabold text-slate-900">
              {formatPrice(price, currency)}
            </span>
            {off != null && (
              <span className="pb-0.5 text-[11px] text-slate-400 line-through">
                {formatPrice(product.price, currency)}
              </span>
            )}
          </div>

          <div className="pt-0.5 text-[11px]">
            {out ? (
              <span className="font-semibold text-rose-500">Out of stock</span>
            ) : (
              <span className="font-medium text-emerald-600">● In stock</span>
            )}
          </div>

          <div className="mt-2 grid grid-cols-[1fr_auto] gap-1.5">
            <button
              type="button"
              onClick={handleAdd}
              disabled={out}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold text-white transition",
                out ? "cursor-not-allowed bg-slate-300" : "brand-gradient hover:opacity-90",
              )}
            >
              <ShoppingCart size={14} /> Add
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Order on WhatsApp"
              className="flex items-center justify-center rounded-xl bg-[#25D366] px-2.5 py-2 text-white transition hover:brightness-95"
            >
              <MessageCircle size={15} />
            </a>
          </div>
        </div>
      </div>

      {quick && (
        <QuickViewModal
          product={product}
          currency={currency}
          whatsapp={whatsapp}
          onClose={() => setQuick(false)}
        />
      )}
    </>
  );
}
