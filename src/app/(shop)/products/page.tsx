import Link from "next/link";
import { Search } from "lucide-react";
import { getCategories, getCategoryBySlug, getProducts, getSettings } from "@/lib/data";
import { ProductGrid } from "@/components/site/ProductGrid";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search?.toString().trim() || undefined;
  const catSlug = sp.category?.toString().trim() || undefined;

  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const activeCat = catSlug ? await getCategoryBySlug(catSlug) : null;

  const products = await getProducts({
    search,
    categoryId: activeCat?.id,
    limit: 60,
  });

  const heading = search
    ? `Results for “${search}”`
    : activeCat
      ? activeCat.name
      : "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{heading}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {products.length} {products.length === 1 ? "product" : "products"} found
        </p>
      </div>

      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-semibold transition",
            !catSlug ? "brand-gradient text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-brand-300",
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              catSlug === c.slug ? "brand-gradient text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-brand-300",
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <Search className="mx-auto mb-3 text-slate-300" size={40} />
          <p className="text-lg font-semibold text-slate-700">No products found</p>
          <p className="mt-1 text-sm text-slate-500">Try a different search term or category.</p>
          <Link href="/products" className="mt-4 inline-block rounded-xl brand-gradient px-5 py-2.5 text-sm font-bold text-white">
            View all products
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} currency={settings.currency} whatsapp={settings.whatsapp} />
      )}
    </div>
  );
}
