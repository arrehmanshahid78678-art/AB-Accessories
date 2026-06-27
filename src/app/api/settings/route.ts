import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { revalidateStorefront } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: await getSettings() });
}

const schema = z.object({
  siteName: z.string(),
  logoText: z.string(),
  logoUrl: z.string().nullable().optional(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  heroImage: z.string().nullable().optional(),
  heroCtaText: z.string(),
  primaryColor: z.string(),
  phone: z.string(),
  email: z.string(),
  address: z.string(),
  whatsapp: z.string(),
  currency: z.string(),
  shippingFee: z.coerce.number().min(0),
  freeShippingThreshold: z.coerce.number().min(0),
  social: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .passthrough(),
  footerLinks: z.array(z.any()),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const d = parsed.data;

  const values = {
    siteName: d.siteName,
    logoText: d.logoText,
    logoUrl: d.logoUrl || null,
    heroTitle: d.heroTitle,
    heroSubtitle: d.heroSubtitle,
    heroImage: d.heroImage || null,
    heroCtaText: d.heroCtaText,
    primaryColor: d.primaryColor,
    phone: d.phone,
    email: d.email,
    address: d.address,
    whatsapp: d.whatsapp,
    currency: d.currency,
    shippingFee: d.shippingFee.toFixed(2),
    freeShippingThreshold: d.freeShippingThreshold.toFixed(2),
    social: d.social,
    footerLinks: d.footerLinks,
    updatedAt: new Date(),
  };

  const existing = await db.select().from(settings).limit(1);
  if (existing.length) {
    await db.update(settings).set(values).where(eq(settings.id, existing[0].id));
  } else {
    await db.insert(settings).values(values);
  }

  revalidateStorefront();
  return NextResponse.json({ ok: true, settings: await getSettings() });
}
