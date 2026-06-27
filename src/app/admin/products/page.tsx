import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Star, Eye, EyeOff } from "lucide-react";
import { getCategories, getProducts, type Product } from "@/lib/data";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { effectivePrice, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts({ includeDisabled: true, limit: 200 }),
    getCategories(),
  ]);
  const catName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">{products.length} products in your catalog</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 rounded-xl brand-gradient px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => {
                const price = effectivePrice(p.price, p.salePrice);
                return (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {p.images[0] && <Image src={p.images[0]} alt={p.title} fill sizes="44px" className="object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/products/${p.id}`} className="line-clamp-1 font-semibold text-slate-800 hover:text-brand-600">
                            {p.title}
                          </Link>
                          <p className="text-xs text-slate-400">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{catName(p.categoryId)}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800">{formatPrice(price)}</span>
                      {p.salePrice && p.salePrice < p.price && (
                        <span className="ml-1 text-xs text-slate-400 line-through">{formatPrice(p.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.stock === 0 ? "bg-rose-100 text-rose-600" : p.stock <= 5 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                            <Star size={10} /> Featured
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${p.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                          {p.enabled ? <Eye size={10} /> : <EyeOff size={10} />}
                          {p.enabled ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/${p.id}`} className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-brand-50 hover:text-brand-600" title="Edit">
                          <Pencil size={16} />
                        </Link>
                        <DeleteButton endpoint="/api/products" id={p.id} label="product" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">No products yet. Click “Add Product” to create one.</p>
        )}
      </div>
    </div>
  );
}
