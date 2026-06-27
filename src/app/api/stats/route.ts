import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stats = await getStats();
  return NextResponse.json({ stats });
}
