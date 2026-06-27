"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const { email, password, remember } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await createSession(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    remember,
  );
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
