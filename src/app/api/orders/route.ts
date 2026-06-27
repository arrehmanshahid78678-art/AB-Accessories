import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getOrders } from "@/lib/data";
import { revalidateStorefront } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = await getOrders(100);
  return NextResponse.json({ orders: list });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = Number(body?.id);
  const status = String(body?.status ?? "");
  if (!Number.isFinite(id) || !status) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  }

  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
