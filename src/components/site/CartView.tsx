"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { effectivePrice, formatPrice } from "@/lib/utils";

export function CartView({
  currency,
  shippingFee,
  freeShipThreshold,
}: {
  currency: string;
  shippingFee: number;
  freeShipThreshold: number;
}) {
  const { items, subtotal, count, setQty, removeItem, ready } = useCart();

  if (ready && items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-100">
          <ShoppingBag size={28} className="text-slate-400" />
        </div>
        <p className="text-lg font-semibold text-slate-700">Your cart is empty</p>
        <p className="mt-1 text-sm text-slate-500">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="mt-5 inline-flex items-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-bold text-white">
          Start shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= freeShipThreshold ? 0 : shippingFee;
  const total = subtotal + shipping;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {items.map((item) => {
            const unit = effectivePrice(item.price, item.salePrice);
            return (
              <li key={item.productId} className="flex gap-4 p-4">
                <Link href={`/products/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  {item.image && <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-slate-800 hover:text-brand-700">
                    {item.title}
                  </Link>
                  <span className="text-xs text-slate-500">{formatPrice(unit, currency)} each</span>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-lg border border-slate-200">
                      <button onClick={() => setQty(item.productId, item.quantity - 1)} className="px-2.5 py-1.5 text-slate-600 hover:text-brand-600" aria-label="Decrease">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => setQty(item.productId, item.quantity + 1)} className="px-2.5 py-1.5 text-slate-600 hover:text-brand-600" aria-label="Increase">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-500">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <span className="self-center text-right text-sm font-bold text-slate-900">
                  {formatPrice(unit * item.quantity, currency)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
        <dl className="mt-4 flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Items ({count})</dt>
            <dd className="font-semibold text-slate-800">{formatPrice(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Shipping</dt>
            <dd className="font-semibold text-slate-800">
              {shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(shipping, currency)}
            </dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-100 pt-3">
            <dt className="text-base font-bold text-slate-900">Total</dt>
            <dd className="text-xl font-extrabold text-slate-900">{formatPrice(total, currency)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl brand-gradient px-5 py-3.5 text-sm font-bold text-white hover:opacity-90">
          Proceed to Checkout <ArrowRight size={16} />
        </Link>
        <Link href="/products" className="mt-2 block text-center text-sm font-semibold text-slate-500 hover:text-brand-600">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
