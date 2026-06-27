import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { specificationsSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import { getProductById } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { revalidateStorefront } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

const updateSchema = z
  .object({
    title: z.string().min(2),
    slug: z.string().min(2),
    description: z.string(),
    categoryId: z.number().int().positive().nullable(),
    brand: z.string(),
    price: z.number().min(0),
    salePrice: z.number().min(0).nullable(),
    stock: z.number().int().min(0),
    rating: z.number().min(0).max(5),
    reviewCount: z.number().int().min(0),
    featured: z.boolean(),
    enabled: z.boolean(),
    specifications: specificationsSchema,
    images: z.array(z.string()),
  })
  .partial();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const d = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (d.title !== undefined) updates.title = d.title;
  if (d.slug !== undefined) updates.slug = (d.slug.trim() || slugify(d.title ?? "")).toLowerCase();
  if (d.description !== undefined) updates.description = d.description || null;
  if (d.categoryId !== undefined) updates.categoryId = d.categoryId;
  if (d.brand !== undefined) updates.brand = d.brand || null;
  if (d.price !== undefined) updates.price = d.price.toFixed(2);
  if (d.salePrice !== undefined) updates.salePrice = d.salePrice != null ? d.salePrice.toFixed(2) : null;
  if (d.stock !== undefined) updates.stock = d.stock;
  if (d.rating !== undefined) updates.rating = d.rating.toFixed(1);
  if (d.reviewCount !== undefined) updates.reviewCount = d.reviewCount;
  if (d.featured !== undefined) updates.featured = d.featured;
  if (d.enabled !== undefined) updates.enabled = d.enabled;
  if (d.specifications !== undefined) updates.specifications = d.specifications ?? null;

  await db.update(products).set(updates).where(eq(products.id, numericId));

  if (d.images !== undefined) {
    await db.delete(productImages).where(eq(productImages.productId, numericId));
    const imgs = d.images.filter(Boolean);
    if (imgs.length > 0) {
      await db.insert(productImages).values(
        imgs.map((url, idx) => ({ productId: numericId, url, position: idx })),
      );
    }
  }

  const result = await getProductById(numericId);
  revalidateStorefront();
  return NextResponse.json({ product: result });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.delete(products).where(eq(products.id, numericId));
  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
