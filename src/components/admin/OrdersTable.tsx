"use client";

import { useState } from "react";
import type { OrderRow } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Loader2, ChevronDown } from "lucide-react";
import { nuclearReload } from "@/lib/force-refresh";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);

  const update = async (id: number, status: string) => {
    setOverrides((o) => ({ ...o, [id]: status }));
    setBusy(id);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setTimeout(() => nuclearReload(), 300);
      } else {
        setBusy(null);
      }
    } catch {
      setBusy(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
        No orders yet. Orders placed on the store will appear here.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const status = overrides[o.id] ?? o.status;
              return (
                <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-bold text-brand-700">{o.orderNumber}</p>
                    <p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{o.customerName}</p>
                    <p className="text-xs text-slate-400">{o.phone}</p>
                    {o.city && <p className="text-xs text-slate-400">{o.city}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="font-semibold">{o.itemCount}</span> items
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-600">
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-flex items-center">
                      <span className={`pointer-events-none mr-2 rounded-full px-2 py-0.5 text-xs font-bold capitalize ${STYLE[status] ?? "bg-slate-100 text-slate-600"}`}>
                        {status}
                      </span>
                      <select
                        value={status}
                        onChange={(e) => update(o.id, e.target.value)}
                        disabled={busy === o.id}
                        className="appearance-none rounded-lg border border-slate-200 bg-white py-1 pl-2 pr-7 text-xs font-semibold text-slate-700 outline-none focus:border-brand-400 disabled:opacity-50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="capitalize">
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="pointer-events-none absolute right-2 text-slate-400" />
                      {busy === o.id && <Loader2 size={12} className="ml-1 animate-spin text-brand-500" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
