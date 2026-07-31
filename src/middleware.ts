import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/** Where each role lives once authenticated. */
const HOME_FOR_ROLE: Record<string, string> = {
  employer: "/employer/dashboard",
  employee: "/employee/portal",
};

/**
 * Read the session token without depending on NEXTAUTH_URL being correct.
 *
 * next-auth derives the cookie name from `NEXTAUTH_URL?.startsWith("https://")`,
 * so a stale `http://localhost:3000` in the deployment environment makes it look
 * for `next-auth.session-token` while the auth route actually set
 * `__Secure-next-auth.session-token`. getToken then returns null for a perfectly
 * valid session and every protected route bounces to /login. Derive it from the
 * real request protocol instead, and check the other cookie name as a fallback.
 */
async function readToken(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const secureCookie = req.nextUrl.protocol === "https:";

  const token = await getToken({ req, secret, secureCookie });
  if (token) return token;

  return await getToken({ req, secret, secureCookie: !secureCookie });
}

export async function middleware(req: NextRequest) {
  const token = await readToken(req);
  const { pathname, search } = req.nextUrl;

  const requiredRole = pathname.startsWith("/employer")
    ? "employer"
    : pathname.startsWith("/employee")
      ? "employee"
      : null;

  if (!requiredRole) return NextResponse.next();

  // No session at all — send them to sign in and come back here after.
  if (!token) {
    const returnUrl = encodeURIComponent(pathname + search);
    return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, req.url));
  }

  // Signed in, wrong area. Sending these to /login would loop forever: the login
  // page sees an authenticated session and pushes straight back to returnUrl.
  // Send them to their own home instead.
  if (token.role !== requiredRole) {
    const home = HOME_FOR_ROLE[token.role as string] ?? "/";
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/employer",
    "/employer/:path*",
    "/employee",
    "/employee/:path*",
  ],
};
