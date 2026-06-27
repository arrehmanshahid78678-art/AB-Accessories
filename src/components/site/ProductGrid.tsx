import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/site/ProductCard";

export function ProductGrid({
  products,
  currency,
  whatsapp,
}: {
  products: Product[];
  currency: string;
  whatsapp: string;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="text-lg font-semibold text-slate-700">No products found</p>
        <p className="mt-1 text-sm text-slate-500">Try a different search or category.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} currency={currency} whatsapp={whatsapp} />
      ))}
    </div>
  );
}
