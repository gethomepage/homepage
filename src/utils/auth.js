import { getToken } from "next-auth/jwt";

import { isAuthEnabled } from "utils/env";

export function isAllowedHost(host) {
  if (process.env.HOMEPAGE_ALLOWED_HOSTS === "*") return true;
  const port = process.env.PORT || 3000;
  const allowedHosts = [`localhost:${port}`, `127.0.0.1:${port}`, `[::1]:${port}`].concat(
    process.env.HOMEPAGE_ALLOWED_HOSTS ? process.env.HOMEPAGE_ALLOWED_HOSTS.split(",") : [],
  );
  if (host && allowedHosts.includes(host)) return true;
  console.error(
    `Host validation failed for: ${host}. Hint: Set the HOMEPAGE_ALLOWED_HOSTS environment variable to allow requests from this host / port.`,
  );
  return false;
}

export function withAllowedHost(handler) {
  return async function hostCheckedHandler(req, res) {
    if (!isAllowedHost(req.headers?.host)) {
      return res.status(400).json({ error: "Host validation failed. See logs for more details." });
    }
    return handler(req, res);
  };
}

// Match NextAuth, which picks the cookie name from the parsed URL protocol
export function secureCookie() {
  try {
    return new URL(process.env.NEXTAUTH_URL || process.env.HOMEPAGE_EXTERNAL_URL).protocol === "https:";
  } catch {
    return false;
  }
}

async function authorized(req, res) {
  if (!isAuthEnabled()) return true;

  res.setHeader("Cache-Control", "private, no-store");
  return Boolean(
    await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || process.env.HOMEPAGE_AUTH_SECRET,
      secureCookie: secureCookie(),
    }),
  );
}

export function withAuth(handler, { public: isPublic } = {}) {
  return withAllowedHost(async function authenticatedHandler(req, res) {
    if (!isPublic?.(req) && !(await authorized(req, res))) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return handler(req, res);
  });
}

export function withPageAuth(getProps) {
  return async function authenticatedPage(context) {
    if (!isAllowedHost(context.req?.headers?.host)) {
      return { notFound: true };
    }
    if (!(await authorized(context.req, context.res))) {
      // resolvedUrl is a path supplied by Next.js, never an external destination.
      const callbackUrl = context.resolvedUrl || "/";
      return {
        redirect: {
          destination: `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          permanent: false,
        },
      };
    }
    return getProps(context);
  };
}
