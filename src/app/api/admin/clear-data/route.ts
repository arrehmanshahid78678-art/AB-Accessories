import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  categories,
  orders,
  productImages,
  products,
  settings,
  visitors,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/clear-data
 *
 * Admin-only endpoint that wipes all store data (products, categories,
 * orders, visitors) but KEEPS:
 * - Admin user account (so you can still log in)
 * - Settings (so site config is preserved)
 *
 * Perfect for starting fresh without losing your admin access.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const confirm = body?.confirm;

    // Safety check — require explicit confirmation
    if (confirm !== "CLEAR_ALL_DATA") {
      return NextResponse.json(
        {
          error:
            "Confirmation required. Send { confirm: 'CLEAR_ALL_DATA' } in request body.",
        },
        { status: 400 },
      );
    }

    // Delete in correct order to respect foreign keys
    await db.delete(productImages);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(orders);
    await db.delete(visitors);

    // Mark data as cleared on the settings row. This prevents the auto-seed
    // from re-inserting demo products when the next page load runs
    // ensureSeedData() against now-empty tables.
    const [settingsRow] = await db.select().from(settings).limit(1);
    if (settingsRow) {
      const existing = (settingsRow.social as any) ?? {};
      await db
        .update(settings)
        .set({
          social: {
            ...existing,
            __dataClearedAt: new Date().toISOString(),
            __seedCompleted: true,
          },
        })
        .where(eq(settings.id, settingsRow.id));
    }

    // Reset auto-increment counters (PostgreSQL-specific)
    try {
      await db.execute(sql`ALTER SEQUENCE products_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE product_images_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE categories_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE orders_id_seq RESTART WITH 1`);
      await db.execute(sql`ALTER SEQUENCE visitors_id_seq RESTART WITH 1`);
    } catch {
      // Sequence reset is optional; ignore if it fails
    }

    // Invalidate all caches so storefront shows empty state immediately
    revalidateStorefront();

    return NextResponse.json({
      ok: true,
      message:
        "All products, categories, orders and visitors have been cleared. Admin account and settings preserved.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("clear-data error:", error);
    return NextResponse.json(
      { error: "Failed to clear data", detail: String(error) },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/clear-data
 *
 * Returns info about what will be deleted (dry-run preview).
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      [{ value: productCount }],
      [{ value: categoryCount }],
      [{ value: orderCount }],
      [{ value: visitorCount }],
    ] = await Promise.all([
      db.select({ value: sql<number>`count(*)::int` }).from(products),
      db.select({ value: sql<number>`count(*)::int` }).from(categories),
      db.select({ value: sql<number>`count(*)::int` }).from(orders),
      db.select({ value: sql<number>`count(*)::int` }).from(visitors),
    ]);

    return NextResponse.json({
      preview: {
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
        visitors: visitorCount,
        total: productCount + categoryCount + orderCount + visitorCount,
      },
      warning:
        "This will DELETE all products, categories, orders and visitors. Admin account and settings will be preserved.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get preview", detail: String(error) },
      { status: 500 },
    );
  }
}
