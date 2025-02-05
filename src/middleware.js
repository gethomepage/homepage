import { NextResponse } from "next/server";

export function middleware(req) {
  // Check the Host header, if HOMEPAGE_ALLOWED_HOSTS is set
  const host = req.headers.get("host");
  const port = process.env.PORT || 3000;
  let allowedHosts = [`localhost:${port}`];
  if (process.env.HOMEPAGE_ALLOWED_HOSTS) {
    allowedHosts = allowedHosts.concat(process.env.HOMEPAGE_ALLOWED_HOSTS.split(","));
  }
  if (!host || !allowedHosts.includes(host)) {
    // eslint-disable-next-line no-console
    console.error(
      `Host validation failed for: ${host}. Hint: Set HOMEPAGE_ALLOWED_HOSTS to allow requests from this host.`,
    );
    return NextResponse.json({ error: "Host validation failed. See logs for more details." }, { status: 400 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
