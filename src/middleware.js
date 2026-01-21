import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const authEnabled = Boolean(process.env.HOMEPAGE_AUTH_ENABLED);
const authSecret = process.env.NEXTAUTH_SECRET || process.env.HOMEPAGE_AUTH_SECRET;
let warnedAllowedHosts = false;

export async function middleware(req) {
  if (!warnedAllowedHosts && process.env.HOMEPAGE_ALLOWED_HOSTS) {
    warnedAllowedHosts = true;
    // eslint-disable-next-line no-console
    console.warn(
      "HOMEPAGE_ALLOWED_HOSTS is deprecated. To secure a publicly accessible homepage, configure authentication instead.",
    );
  }

  if (authEnabled) {
    const token = await getToken({ req, secret: authSecret });
    if (!token) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Protect all app and API routes; allow Next.js internals, public assets, auth pages, and NextAuth endpoints.
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|sitemap.xml|icons/|api/auth|auth/).*)",
  ],
};
