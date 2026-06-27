import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { getCategories } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { revalidateStorefront } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await getCategories();
  return NextResponse.json({ categories: list });
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

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const d = parsed.data;

  let slug = (d.slug?.trim() || slugify(d.name)).toLowerCase();
  const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1);
  if (existing.length) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const [created] = await db
    .insert(categories)
    .values({
      name: d.name,
      slug,
      description: d.description ?? null,
      image: d.image ?? null,
    })
    .returning({ id: categories.id, slug: categories.slug });

  revalidateStorefront();
  return NextResponse.json({ category: created }, { status: 201 });
}
