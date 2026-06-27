"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, MessageCircle, Check, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/components/cart/CartProvider";
import { RatingStars } from "@/components/site/RatingStars";
import { discountPercent, effectivePrice, formatPrice } from "@/lib/utils";

export function ProductDetailClient({
  product,
  currency,
  whatsapp,
}: {
  product: Product;
  currency: string;
  whatsapp: string;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const images = product.images.length ? product.images : ["/images/placeholder.svg"];
  const price = effectivePrice(product.price, product.salePrice);
  const off = discountPercent(product.price, product.salePrice);
  const out = product.stock <= 0;

  const handleAdd = (buyNow = false) => {
    if (out) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        image: product.images[0] ?? null,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
      },
      qty,
    );
    if (buyNow) {
      router.push("/checkout");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const waText = encodeURIComponent(
    `Hi AB Accessories! I'd like to order:\n*${product.title}* (x${qty})\nTotal: ${formatPrice(price * qty, currency)}`,
  );
  const waNumber = whatsapp ? whatsapp.replace(/\D/g, "") : "";
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : `https://wa.me/?text=${waText}`;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Gallery */}
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <Image
            key={active}
            src={images[active]}
            alt={product.title}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover animate-fade-in"
          />
          {off != null && (
            <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-sm font-extrabold text-white shadow">
              -{off}%
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                  active === i ? "border-brand-500" : "border-transparent hover:border-slate-300"
                }`}
              >
                <Image src={img} alt={`${product.title} ${i + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col">
        {product.brand && (
          <span className="text-sm font-bold uppercase tracking-wider text-brand-600">{product.brand}</span>
        )}
        <h1 className="mt-1 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
          {product.title}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <RatingStars rating={product.rating} size={16} showValue count={product.reviewCount} />
        </div>

        <div className="mt-4 flex items-end gap-3">
          <span className="text-3xl font-extrabold text-slate-900">{formatPrice(price, currency)}</span>
          {off != null && (
            <span className="pb-1 text-lg text-slate-400 line-through">
              {formatPrice(product.price, currency)}
            </span>
          )}
          {off != null && (
            <span className="mb-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">
              Save {off}%
            </span>
          )}
        </div>

        <div className="mt-3 text-sm">
          {out ? (
            <span className="font-semibold text-rose-500">● Out of stock</span>
          ) : (
            <span className="font-semibold text-emerald-600">● In stock — {product.stock} available</span>
          )}
        </div>

        {product.description && (
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>
        )}

        {/* Quantity + actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-3 text-slate-600 hover:text-brand-600" aria-label="Decrease">
              <Minus size={16} />
            </button>
            <span className="w-10 text-center font-bold">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} className="px-3 py-3 text-slate-600 hover:text-brand-600" aria-label="Increase">
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => handleAdd(false)}
            disabled={out}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-brand-600 px-5 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
            {added ? "Added to cart" : "Add to cart"}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => handleAdd(true)}
            disabled={out}
            className="flex items-center justify-center gap-2 rounded-xl brand-gradient px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <ShoppingCart size={18} /> Buy Now
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
          >
            <MessageCircle size={18} /> Order on WhatsApp
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
          {[
            { icon: Truck, label: "Fast Delivery" },
            { icon: ShieldCheck, label: "Genuine Product" },
            { icon: RotateCcw, label: "Easy Returns" },
          ].map((b) => (
            <div key={b.label} className="flex flex-col items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <b.icon size={18} />
              </span>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
