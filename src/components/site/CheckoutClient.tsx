"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { effectivePrice, formatPrice } from "@/lib/utils";

type PlacedOrder = { orderNumber: string; total: number };

export function CheckoutClient({
  currency,
  shippingFee,
  freeShipThreshold,
  whatsapp,
}: {
  currency: string;
  shippingFee: number;
  freeShipThreshold: number;
  whatsapp: string;
}) {
  const { items, subtotal, clear, ready } = useCart();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    note: "",
    paymentMethod: "cod",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  const shipping = subtotal >= freeShipThreshold ? 0 : shippingFee;
  const total = subtotal + shipping;
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed. Please try again.");
        setLoading(false);
        return;
      }
      setOrder({ orderNumber: data.order.orderNumber, total: data.order.total });
      clear();
    } catch {
      setError("A network error occurred. Please try again.");
    }
    setLoading(false);
  };

  if (order) {
    const waText = encodeURIComponent(
      `Hi AB Accessories! I just placed an order.\nOrder #: ${order.orderNumber}\nTotal: ${formatPrice(order.total, currency)}\nName: ${form.customerName}`,
    );
    const waNumber = whatsapp ? whatsapp.replace(/\D/g, "") : "";
    const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : `https://wa.me/?text=${waText}`;
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 size={36} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Order placed!</h2>
        <p className="mt-1 text-sm text-slate-500">Thank you, {form.customerName.split(" ")[0] || "customer"}!</p>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Order Number</p>
          <p className="text-lg font-extrabold text-brand-700">{order.orderNumber}</p>
          <p className="mt-2 text-sm text-slate-600">
            Total payable: <strong>{formatPrice(order.total, currency)}</strong>
          </p>
          {form.paymentMethod === "cod" && (
            <p className="mt-1 text-xs text-slate-500">Cash on Delivery — pay when your order arrives.</p>
          )}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          We&apos;ll call you shortly to confirm. For quick confirmation, message us on WhatsApp.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white hover:brightness-95">
            <MessageCircle size={16} /> Confirm on WhatsApp
          </a>
          <Link href="/products" className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (ready && items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-100">
          <ShoppingBag size={28} className="text-slate-400" />
        </div>
        <p className="text-lg font-semibold text-slate-700">Your cart is empty</p>
        <Link href="/products" className="mt-5 inline-block rounded-xl brand-gradient px-6 py-3 text-sm font-bold text-white">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Delivery Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name *" value={form.customerName} onChange={(v) => set("customerName", v)} required />
          <Field label="Phone Number *" value={form.phone} onChange={(v) => set("phone", v)} required type="tel" />
          <Field label="Email (optional)" value={form.email} onChange={(v) => set("email", v)} type="email" />
          <Field label="City" value={form.city} onChange={(v) => set("city", v)} />
          <div className="sm:col-span-2">
            <Field label="Delivery Address *" value={form.address} onChange={(v) => set("address", v)} required textarea />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => set("paymentMethod", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400"
            >
              <option value="cod">Cash on Delivery</option>
              <option value="bank">Bank Transfer</option>
              <option value="whatsapp">WhatsApp / Confirm on call</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Field label="Order Note (optional)" value={form.note} onChange={(v) => set("note", v)} textarea />
          </div>
        </div>
        {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">Your Order</h2>
        <ul className="mt-3 flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center justify-between gap-2 text-sm">
              <span className="line-clamp-1 text-slate-600">
                {i.title} <span className="text-slate-400">×{i.quantity}</span>
              </span>
              <span className="font-semibold text-slate-800">
                {formatPrice(effectivePrice(i.price, i.salePrice) * i.quantity, currency)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="font-semibold">{formatPrice(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Shipping</dt>
            <dd className="font-semibold">{shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(shipping, currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2">
            <dt className="text-base font-bold">Total</dt>
            <dd className="text-xl font-extrabold">{formatPrice(total, currency)}</dd>
          </div>
        </dl>
        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl brand-gradient px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? "Placing order…" : "Place Order"}
        </button>
      </aside>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} required={required} rows={2} className={cls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className={cls} />
      )}
    </div>
  );
}
