import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_ALG, SESSION_COOKIE, getAuthSecret } from "@/lib/session-config";

/**
 * Route protection for the admin area.
 * Edge-runtime compatible — only uses `jose` (no Node-only deps).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let /admin open for everyone. If logged out, the page itself shows the
  // admin login form. Deeper admin pages stay protected below.
  if (pathname === "/admin") return NextResponse.next();

  const isAdmin = pathname.startsWith("/admin/");

  if (!isAdmin) return NextResponse.next();

  // Same secret resolver used by the server auth layer, so sessions created at
  // login always verify here (and it never crashes if AUTH_SECRET is unset).
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  let authorized = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getAuthSecret(), {
        algorithms: [AUTH_ALG],
      });
      authorized = payload.role === "admin";
    } catch {
      authorized = false;
    }
  }

  if (!authorized) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
