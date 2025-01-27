import { NextResponse } from "next/server";

export function middleware(req) {
  // Check the Host header, if HOMEPAGE_ALLOWED_HOSTS is set
  const host = req.headers.get("host");
  const allowedHosts = process.env.HOMEPAGE_ALLOWED_HOSTS
    ? process.env.HOMEPAGE_ALLOWED_HOSTS.split(",").concat(["localhost:3000"])
    : [];
  if (allowedHosts.length && !(host || allowedHosts.includes(host))) {
    return new NextResponse("Invalid Host header", { status: 400 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
