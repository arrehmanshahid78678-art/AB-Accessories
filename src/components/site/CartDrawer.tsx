"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { effectivePrice, formatPrice } from "@/lib/utils";

export function CartDrawer({ currency, freeShipThreshold }: { currency: string; freeShipThreshold: number }) {
  const { items, subtotal, count, open, setOpen, setQty, removeItem, ready } = useCart();

  const remaining = Math.max(0, freeShipThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeShipThreshold) * 100);

  return (
    <div className={`fixed inset-0 z-[90] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag size={20} className="text-brand-600" />
            Your Cart ({count})
          </h2>
          <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {ready && items.length > 0 && (
          <div className="border-b border-slate-100 bg-brand-50/50 px-5 py-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-brand-800">
              <Truck size={14} />
              {remaining > 0 ? (
                <span>
                  Add <strong>{formatPrice(remaining, currency)}</strong> more for free delivery
                </span>
              ) : (
                <span>You unlocked free delivery! 🎉</span>
              )}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
              <div className="h-full brand-gradient transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!ready ? null : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100">
                <ShoppingBag size={28} className="text-slate-400" />
              </div>
              <p className="font-semibold text-slate-700">Your cart is empty</p>
              <p className="text-sm text-slate-500">Browse our premium accessories and find something you love.</p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-xl brand-gradient px-5 py-2.5 text-sm font-bold text-white"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => {
                const unit = effectivePrice(item.price, item.salePrice);
                return (
                  <li key={item.productId} className="flex gap-3 rounded-2xl border border-slate-100 p-2.5">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50"
                    >
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" />
                      ) : null}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="line-clamp-2 text-sm font-semibold text-slate-800 hover:text-brand-700"
                      >
                        {item.title}
                      </Link>
                      <span className="text-xs text-slate-500">{formatPrice(unit, currency)}</span>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-slate-200">
                          <button
                            onClick={() => setQty(item.productId, item.quantity - 1)}
                            className="px-2 py-1 text-slate-600 hover:text-brand-600"
                            aria-label="Decrease"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => setQty(item.productId, item.quantity + 1)}
                            className="px-2 py-1 text-slate-600 hover:text-brand-600"
                            aria-label="Increase"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-slate-400 hover:text-rose-500"
                          aria-label="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <span className="self-center text-sm font-bold text-slate-900">
                      {formatPrice(unit * item.quantity, currency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {ready && items.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">Subtotal</span>
              <span className="text-xl font-extrabold">{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Continue
              </Link>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="rounded-xl brand-gradient px-4 py-3 text-center text-sm font-bold text-white hover:opacity-90"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
