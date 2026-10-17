import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { isAllowedHost, secureCookie } from "utils/auth";
import { isAuthEnabled } from "utils/env";

const authEnabled = isAuthEnabled();
const authSecret = process.env.NEXTAUTH_SECRET || process.env.HOMEPAGE_AUTH_SECRET;

// Prerendered pages carry `s-maxage`, and the dashboard HTML embeds the service and
// bookmark inventory. Without this, a CDN or caching reverse proxy in front of Homepage
// would store an authenticated response and serve it to anonymous visitors.
function withPrivateCache(res) {
  if (authEnabled) {
    res.headers.set("Cache-Control", "private, no-store");
  }
  return res;
}

export async function middleware(req) {
  if (!isAllowedHost(req.headers.get("host"))) {
    return NextResponse.json({ error: "Host validation failed. See logs for more details." }, { status: 400 });
  }

  const { pathname, search } = new URL(req.url);
  const isPublicAuthPath = pathname.startsWith("/api/healthcheck") || pathname === "/api/config/custom.css";
  if (authEnabled && !isPublicAuthPath) {
    // The MCP API handler authorizes both bearer tokens and Homepage sessions.
    if (pathname === "/api/mcp") {
      return withPrivateCache(NextResponse.next());
    }

    const token = await getToken({ req, secret: authSecret, secureCookie: secureCookie() });
    if (!token) {
      const signInUrl = new URL("/auth/signin", req.url);
      // Same-origin by construction, so this cannot be used as an open redirect
      signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return withPrivateCache(NextResponse.redirect(signInUrl));
    }
  }

  return withPrivateCache(NextResponse.next());
}

export const config = {
  // Protect all app and API routes; allow Next.js internals, public assets, auth pages, and NextAuth endpoints.
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|sitemap.xml|icons/|api/auth|auth/).*)",
  ],
};
