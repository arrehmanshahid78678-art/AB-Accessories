import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { getCategories } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { revalidateStorefront } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

const updateSchema = z
  .object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string(),
    image: z.string(),
  })
  .partial();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }
  const d = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (d.name !== undefined) updates.name = d.name;
  if (d.slug !== undefined) updates.slug = (d.slug.trim() || slugify(d.name ?? "")).toLowerCase();
  if (d.description !== undefined) updates.description = d.description || null;
  if (d.image !== undefined) updates.image = d.image || null;

  await db.update(categories).set(updates).where(eq(categories.id, numericId));
  const list = await getCategories();
  revalidateStorefront();
  return NextResponse.json({ category: list.find((c) => c.id === numericId) ?? null });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await db.delete(categories).where(eq(categories.id, numericId));
  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
