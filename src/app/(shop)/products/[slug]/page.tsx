import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  getProductBySlug,
  getRelatedProducts,
  getSettings,
  getCategoryById,
} from "@/lib/data";
import { ProductDetailClient } from "@/components/site/ProductDetailClient";
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
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description ?? `${product.brand ?? ""} ${product.title}`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related, category] = await Promise.all([
    getSettings(),
    getRelatedProducts(product, 5),
    product.categoryId ? getCategoryById(product.categoryId) : Promise.resolve(null),
  ]);

  const specs = product.specifications;
  const specRows = specs
    ? [
        { label: "Compatibility", value: specs.compatibility },
        { label: "Material", value: specs.material },
        { label: "Color", value: specs.color },
        { label: "Charging Speed", value: specs.chargingSpeed },
        { label: "Cable Length", value: specs.cableLength },
        { label: "Warranty", value: specs.warranty },
      ].filter((r) => r.value)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight size={12} />
        <Link href="/products" className="hover:text-brand-600">Products</Link>
        {category && (
          <>
            <ChevronRight size={12} />
            <Link href={`/category/${category.slug}`} className="hover:text-brand-600">
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="font-medium text-slate-700">{product.title}</span>
      </nav>

      <ProductDetailClient
        product={product}
        currency={settings.currency}
        whatsapp={settings.whatsapp}
      />

      {/* Specifications */}
      {(specRows.length > 0 || (specs?.features && specs.features.length > 0)) && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-extrabold text-slate-900">Specifications</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {specRows.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <tbody>
                    {specRows.map((r, i) => (
                      <tr key={r.label} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                        <th className="w-1/3 px-4 py-3 text-left font-semibold text-slate-500">{r.label}</th>
                        <td className="px-4 py-3 text-slate-800">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {specs?.features && specs.features.length > 0 && (
              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Key Features</h3>
                <ul className="flex flex-col gap-2">
                  {specs.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-extrabold text-slate-900">You may also like</h2>
          <ProductGrid products={related} currency={settings.currency} whatsapp={settings.whatsapp} />
        </section>
      )}
    </div>
  );
}
