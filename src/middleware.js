import { NextResponse } from "next/server";

function unauthorized(req) {
  const realm = 'Basic realm="Homepage Configurator"';
  const pathname = req.nextUrl?.pathname || "";

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthorized configurator access." },
      { status: 401, headers: { "WWW-Authenticate": realm } },
    );
  }

  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": realm,
    },
  });
}

function parseBasicAuth(header) {
  if (!header || !header.startsWith("Basic ")) {
    return null;
  }

  const token = header.slice(6).trim();
  if (!token) {
    return null;
  }

  try {
    const decoded = atob(token);
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function shouldProtectConfigurator(req) {
  const pathname = req.nextUrl?.pathname || "";
  return pathname === "/configurator" || pathname.startsWith("/api/config-editor");
}

function hasConfiguratorAuth(req) {
  const requiredPassword = process.env.HOMEPAGE_CONFIGURATOR_PASSWORD;
  if (!requiredPassword) {
    return true;
  }

  const requiredUsername = process.env.HOMEPAGE_CONFIGURATOR_USERNAME || "admin";
  const auth = parseBasicAuth(req.headers.get("authorization"));

  return !!auth && auth.username === requiredUsername && auth.password === requiredPassword;
}

export function middleware(req) {
  if (shouldProtectConfigurator(req) && !hasConfiguratorAuth(req)) {
    return unauthorized(req);
  }

  // Check the Host header, if HOMEPAGE_ALLOWED_HOSTS is set
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
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/configurator"],
};
