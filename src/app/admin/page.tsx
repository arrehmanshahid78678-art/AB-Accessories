import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ShoppingCart,
  Banknote,
  Users,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/lib/auth";
import { getOrders, getProducts, getStats, type OrderRow, type Product } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

function AdminLoginScreen() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[1fr_460px]">
          <div className="hidden bg-slate-900 p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl brand-gradient text-lg font-black text-white">
                AB
              </span>
              <div>
                <p className="text-xl font-extrabold text-white">AB Accessories</p>
                <p className="text-sm text-white/50">Secure Admin Panel</p>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold leading-tight text-white">
                Manage products, orders and store settings.
              </h1>
              <p className="mt-4 max-w-md text-white/60">
                Sign in with your private admin credentials to open the dashboard and edit products.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-white/75">
                {[
                  "Edit products",
                  "Update prices",
                  "Manage stock",
                  "Store settings",
                ].map((item) => (
                  <div key={item} className="rounded-xl bg-white/10 px-3 py-2">
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>

            <Link href="/" className="text-sm font-semibold text-white/50 hover:text-white">
              ← Back to storefront
            </Link>
          </div>

          <div className="bg-slate-50 p-6 text-slate-900 sm:p-10">
            <div className="mb-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl brand-gradient text-lg font-black text-white lg:hidden">
                AB
              </span>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Admin sign in</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the private admin email and password to continue.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session) {
    return <AdminLoginScreen />;
  }

  const [stats, orders, allProducts] = await Promise.all([
    getStats(),
    getOrders(6),
    getProducts({ includeDisabled: true, limit: 200 }),
  ]);
  const lowStock = allProducts.filter((p) => p.stock <= 5).slice(0, 6);

  const cards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, tint: "from-violet-500 to-brand-600" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, tint: "from-blue-500 to-indigo-600" },
    { label: "Revenue", value: formatPrice(stats.revenue), icon: Banknote, tint: "from-emerald-500 to-teal-600" },
    { label: "Visitors", value: stats.visitors, icon: Users, tint: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back — here&apos;s your store at a glance.</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 rounded-xl brand-gradient px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.tint} text-white`}>
                <c.icon size={18} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{c.value}</p>
            <p className="text-xs font-medium text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Clock className="text-amber-600" size={20} />
          <div>
            <p className="text-sm font-bold text-amber-800">{stats.pendingOrders} pending orders</p>
            <p className="text-xs text-amber-600">Awaiting confirmation</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="text-rose-600" size={20} />
          <div>
            <p className="text-sm font-bold text-rose-800">{stats.lowStock} low-stock products</p>
            <p className="text-xs text-rose-600">Stock at or below 5 units</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-slate-900">Recent Orders</h2>
              <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-400">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3 font-semibold">Order</th>
                      <th className="px-5 py-3 font-semibold">Customer</th>
                      <th className="px-5 py-3 font-semibold">Total</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: OrderRow) => (
                      <tr key={o.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3 font-mono text-xs font-bold text-brand-700">{o.orderNumber}</td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800">{o.customerName}</p>
                          <p className="text-xs text-slate-400">{o.phone}</p>
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-800">{formatPrice(o.total)}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${STATUS_STYLES[o.status] ?? "bg-slate-100 text-slate-600"}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Low Stock</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">All stocked up 🎉</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {lowStock.map((p: Product) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {p.images[0] && <Image src={p.images[0]} alt={p.title} fill sizes="40px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/products/${p.id}`} className="line-clamp-1 text-sm font-semibold text-slate-800 hover:text-brand-600">
                      {p.title}
                    </Link>
                    <p className="text-xs text-slate-400">{p.brand}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.stock === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700"}`}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
