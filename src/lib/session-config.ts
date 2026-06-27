// Lightweight, edge-safe constants shared between the server auth layer
// (src/lib/auth.ts) and the route-protection middleware (src/middleware.ts).
// Keeping these in a dependency-free module guarantees the middleware bundle
// never pulls in Node-only code (bcryptjs / next/headers).
export const SESSION_COOKIE = "ab_admin_session";
export const AUTH_ALG = "HS256";
export const SESSION_MAX_AGE_REMEMBER = 60 * 60 * 24 * 30; // 30 days
export const SESSION_MAX_AGE_SESSION = 60 * 60 * 8; // 8 hours

// Built-in fallback secret used ONLY when AUTH_SECRET is not configured in the
// runtime environment. This guarantees the app boots and login works everywhere
// (preview, local, Vercel) without crashing. In production you SHOULD set the
// AUTH_SECRET env var to a strong random string for real security.
const FALLBACK_SECRET = "ab-accessories-default-jwt-secret-v1-do-not-rely-in-prod";

/** Resolve the JWT signing secret as bytes (works in both Node & Edge runtimes). */
export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || FALLBACK_SECRET;
  return new TextEncoder().encode(secret);
}
