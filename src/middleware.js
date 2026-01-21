import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const authEnabled = process.env.HOMEPAGE_AUTH_ENABLED === "true";
const authSecret = process.env.NEXTAUTH_SECRET || process.env.HOMEPAGE_AUTH_SECRET;

export async function middleware(req) {
  // Host validation (status quo)
  const host = req.headers.get("host");
  const port = process.env.PORT || 3000;
  let allowedHosts = [`localhost:${port}`, `127.0.0.1:${port}`, `[::1]:${port}`];
  const allowAll = process.env.HOMEPAGE_ALLOWED_HOSTS === "*";
  if (process.env.HOMEPAGE_ALLOWED_HOSTS) {
    allowedHosts = allowedHosts.concat(process.env.HOMEPAGE_ALLOWED_HOSTS.split(","));
  }
  if (!allowAll && (!host || !allowedHosts.includes(host))) {
    console.error(
      `Host validation failed for: ${host}. Hint: Set the HOMEPAGE_ALLOWED_HOSTS environment variable to allow requests from this host / port.`,
    );
    return NextResponse.json({ error: "Host validation failed. See logs for more details." }, { status: 400 });
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
