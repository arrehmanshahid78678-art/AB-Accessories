import { notFound } from "next/navigation";
import { getCategories, getProductById } from "@/lib/data";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(Number(id)),
    getCategories(),
  ]);
  if (!product) notFound();
  return <ProductForm product={product} categories={categories} />;
}
