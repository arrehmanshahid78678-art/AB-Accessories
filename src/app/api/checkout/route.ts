import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, productImages, orders } from "@/db/schema";
import { asc, inArray } from "drizzle-orm";
import { checkoutSchema } from "@/lib/validations";
import { getSettings } from "@/lib/data";
import { genOrderNumber, toNumber } from "@/lib/utils";
import { revalidateStorefront } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const parsed = checkoutSchema.safeParse({
      customerName: body?.customerName,
      email: body?.email,
      phone: body?.phone,
      address: body?.address,
      city: body?.city,
      paymentMethod: body?.paymentMethod ?? "cod",
      note: body?.note,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid checkout data." },
        { status: 422 },
      );
    }

    const rawItems: Array<{ productId: number; quantity: number }> = Array.isArray(body?.items)
      ? body.items
      : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const ids = rawItems.map((i) => Number(i.productId)).filter((n) => Number.isFinite(n));
    const productRows = ids.length
      ? await db.select().from(products).where(inArray(products.id, ids))
      : [];
    const imgRows = ids.length
      ? await db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.position))
      : [];
    const firstImage = new Map<number, string>();
    for (const r of imgRows) {
      if (!firstImage.has(r.productId)) firstImage.set(r.productId, r.url);
    }

    const items = [];
    let subtotal = 0;
    for (const ri of rawItems) {
      const p = productRows.find((x) => x.id === Number(ri.productId));
      if (!p) continue;
      const qty = Math.max(1, Math.min(Number(ri.quantity) || 1, p.stock > 0 ? p.stock : 99));
      const priceNum =
        p.salePrice != null &&
        toNumber(p.salePrice) > 0 &&
        toNumber(p.salePrice) < toNumber(p.price)
          ? toNumber(p.salePrice)
          : toNumber(p.price);
      items.push({
        productId: p.id,
        title: p.title,
        image: firstImage.get(p.id) ?? null,
        price: priceNum,
        quantity: qty,
      });
      subtotal += priceNum * qty;
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "No valid items in cart." }, { status: 400 });
    }

    const settings = await getSettings();
    const shipping =
      subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    const total = subtotal + shipping;
    const orderNumber = genOrderNumber();
    const itemCount = items.reduce((n, i) => n + i.quantity, 0);

    const [created] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerName: parsed.data.customerName,
        email: parsed.data.email || null,
        phone: parsed.data.phone,
        address: parsed.data.address,
        city: parsed.data.city || null,
        items,
        itemCount,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        status: "pending",
        paymentMethod: parsed.data.paymentMethod,
        note: parsed.data.note || null,
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    revalidateStorefront();
    return NextResponse.json(
      {
        ok: true,
        order: {
          id: created?.id,
          orderNumber: created?.orderNumber,
          total,
          subtotal,
          shipping,
          itemCount,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json({ error: "Could not place order." }, { status: 500 });
  }
}
