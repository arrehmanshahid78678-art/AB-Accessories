import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import {
  AUTH_ALG,
  SESSION_COOKIE,
  SESSION_MAX_AGE_REMEMBER,
  SESSION_MAX_AGE_SESSION,
  getAuthSecret,
} from "@/lib/session-config";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type JWTPayload = SessionUser & { iat?: number; exp?: number };

/** Hash a plaintext password with bcrypt (10 rounds). */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Compare a plaintext password against a bcrypt hash. */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Create a signed JWT session cookie. */
export async function createSession(user: SessionUser, remember = false): Promise<void> {
  const maxAge = remember ? SESSION_MAX_AGE_REMEMBER : SESSION_MAX_AGE_SESSION;
  const token = await new SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: AUTH_ALG })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getAuthSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/** Read & verify the session from the request cookies (server-side). */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const p = payload as JWTPayload;
    if (p.role !== "admin") return null;
    return { id: p.id, name: p.name, email: p.email, role: p.role };
  } catch {
    return null;
  }
}

/** Throws "UNAUTHORIZED" when no admin session exists. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

/** Destroy the session cookie (logout). */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}
