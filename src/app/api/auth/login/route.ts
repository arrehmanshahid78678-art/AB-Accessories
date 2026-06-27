import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, verifyPassword } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";
import { loginSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // If someone opens /login directly before visiting the homepage, make sure
    // the admin user, settings, categories and sample products already exist.
    await ensureSeedData();

    const body = await req.json().catch(() => ({}));
    const parsed = loginSchema.safeParse({
      email: body?.email,
      password: body?.password,
      remember: body?.remember ? "on" : undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid credentials." },
        { status: 400 },
      );
    }

    const { email, password, remember } = parsed.data;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createSession(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      remember,
    );

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      redirectTo: "/admin",
    });
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
