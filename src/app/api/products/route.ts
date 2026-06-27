import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { getCategoryBySlug, getProductById, getProducts } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { revalidateStorefront } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? undefined;
  const categorySlug = url.searchParams.get("category") ?? undefined;
  const featured = url.searchParams.get("featured") === "true";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 60), 120);

  let categoryId: number | undefined;
  if (categorySlug) {
    const cat = await getCategoryBySlug(categorySlug);
    categoryId = cat?.id;
  }

  const list = await getProducts({ search, categoryId, featured, limit });
  return NextResponse.json({ products: list });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const d = parsed.data;

  let slug = (d.slug?.trim() || slugify(d.title)).toLowerCase();
  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (existing.length) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const [created] = await db
    .insert(products)
    .values({
      title: d.title,
      slug,
      description: d.description ?? null,
      specifications: d.specifications ?? null,
      categoryId: d.categoryId ?? null,
      brand: d.brand || null,
      price: d.price.toFixed(2),
      salePrice: d.salePrice != null ? d.salePrice.toFixed(2) : null,
      stock: d.stock,
      rating: d.rating.toFixed(1),
      reviewCount: d.reviewCount,
      featured: d.featured,
      enabled: d.enabled,
    })
    .returning({ id: products.id });

  const imgs = (d.images ?? []).filter(Boolean);
  if (created && imgs.length > 0) {
    await db.insert(productImages).values(
      imgs.map((url, idx) => ({ productId: created.id, url, position: idx })),
    );
  }

  const result = created ? await getProductById(created.id) : null;
  revalidateStorefront();
  return NextResponse.json({ product: result }, { status: 201 });
}
