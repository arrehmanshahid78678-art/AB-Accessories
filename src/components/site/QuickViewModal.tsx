"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, ShoppingCart, MessageCircle, Check } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/components/cart/CartProvider";
import { discountPercent, effectivePrice, formatPrice } from "@/lib/utils";
import { RatingStars } from "@/components/site/RatingStars";

export function QuickViewModal({
  product,
  currency,
  whatsapp,
  onClose,
}: {
  product: Product;
  currency: string;
  whatsapp: string;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const image = product.images[0] ?? "/images/placeholder.svg";
  const price = effectivePrice(product.price, product.salePrice);
  const off = discountPercent(product.price, product.salePrice);
  const out = product.stock <= 0;
  const specs = product.specifications;

  const handleAdd = () => {
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
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const waText = encodeURIComponent(
    `Hi AB Accessories! I'd like to order:\n*${product.title}* (x${qty})\nPrice: ${formatPrice(price * qty, currency)}`,
  );
  const waNumber = whatsapp ? whatsapp.replace(/\D/g, "") : "";
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl animate-scale-in sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-slate-600 shadow transition hover:bg-slate-100"
        >
          <X size={18} />
        </button>

        <div className="grid gap-0 sm:grid-cols-2">
          <div className="relative aspect-square bg-slate-50">
            <Image src={image} alt={product.title} fill sizes="50vw" className="object-cover" />
            {off != null && (
              <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-3 py-1 text-xs font-extrabold text-white shadow">
                -{off}%
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 p-5">
            {product.brand && (
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {product.brand}
              </span>
            )}
            <h3 className="text-lg font-bold leading-tight text-slate-900">{product.title}</h3>
            <div className="flex items-center gap-2">
              <RatingStars rating={product.rating} showValue count={product.reviewCount} />
            </div>

            <div className="flex items-end gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {formatPrice(price, currency)}
              </span>
              {off != null && (
                <span className="pb-1 text-sm text-slate-400 line-through">
                  {formatPrice(product.price, currency)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-sm leading-relaxed text-slate-600 line-clamp-4">
                {product.description}
              </p>
            )}

            {specs && (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-xl bg-slate-50 p-3 text-xs">
                {specs.compatibility && (
                  <div className="col-span-2">
                    <dt className="font-semibold text-slate-500">Compatibility</dt>
                    <dd className="text-slate-700">{specs.compatibility}</dd>
                  </div>
                )}
                {specs.warranty && (
                  <div>
                    <dt className="font-semibold text-slate-500">Warranty</dt>
                    <dd className="text-slate-700">{specs.warranty}</dd>
                  </div>
                )}
                {specs.chargingSpeed && (
                  <div>
                    <dt className="font-semibold text-slate-500">Speed</dt>
                    <dd className="text-slate-700">{specs.chargingSpeed}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="mt-1 text-sm">
              {out ? (
                <span className="font-semibold text-rose-500">Out of stock</span>
              ) : (
                <span className="font-medium text-emerald-600">● In stock ({product.stock} left)</span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-600 hover:text-brand-600"
                  aria-label="Decrease"
                >
                  <Minus size={15} />
                </button>
                <span className="w-8 text-center text-sm font-bold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  className="px-3 py-2 text-slate-600 hover:text-brand-600"
                  aria-label="Increase"
                >
                  <Plus size={15} />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={out}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl brand-gradient px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                {added ? "Added!" : "Add to cart"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <Link
                href={`/products/${product.slug}`}
                onClick={() => onClose()}
                className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Full details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useQuickViewRouter() {
  return useRouter();
}
