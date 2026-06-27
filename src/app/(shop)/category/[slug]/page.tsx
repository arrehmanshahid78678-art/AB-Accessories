import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug, getProducts, getSettings } from "@/lib/data";
import { ProductGrid } from "@/components/site/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  return { title: cat?.name ?? "Category", description: cat?.description ?? undefined };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [settings, products] = await Promise.all([
    getSettings(),
    getProducts({ categoryId: category.id, limit: 60 }),
  ]);

  return (
    <div>
      {category.image && (
        <div className="relative h-48 overflow-hidden bg-slate-900 sm:h-64">
          <Image src={category.image} alt={category.name} fill priority sizes="100vw" className="object-cover opacity-50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{category.name}</h1>
            {category.description && (
              <p className="mt-1 max-w-xl px-4 text-sm text-white/80">{category.description}</p>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        {!category.image && (
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{category.name}</h1>
            {category.description && <p className="mt-1 text-sm text-slate-500">{category.description}</p>}
          </div>
        )}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
          <Link href="/products" className="text-sm font-bold text-brand-700 hover:text-brand-800">
            ← All products
          </Link>
        </div>

        <ProductGrid products={products} currency={settings.currency} whatsapp={settings.whatsapp} />
      </div>
    </div>
  );
}
