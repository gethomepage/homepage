import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// Existing host validation middleware
function hostValidationMiddleware(req) {
  const host = req.headers.get("host");
  const port = process.env.PORT || 3000;
  let allowedHosts = [`localhost:${port}`, `127.0.0.1:${port}`];
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
  return NextResponse.next();
}

// Combine host validation with next-auth middleware
export const middleware = withAuth(
  function middleware(req) {
    // Apply host validation for API routes
    if (req.nextUrl.pathname.startsWith("/api")) {
      return hostValidationMiddleware(req);
    }
    // For non-API routes, next-auth handles authentication
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Require a valid session
    },
  }
);

export const config = {
  matcher: ["/", "/settings", "/api/:path*"], // Protect homepage, settings, and API routes
};