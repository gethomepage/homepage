import { getToken } from "next-auth/jwt";

import { isAuthEnabled } from "utils/env";

async function authorized(req, res) {
  if (!isAuthEnabled()) return true;

  res.setHeader("Cache-Control", "private, no-store");
  const authUrl = process.env.NEXTAUTH_URL || process.env.HOMEPAGE_EXTERNAL_URL || "";
  return Boolean(
    await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || process.env.HOMEPAGE_AUTH_SECRET,
      secureCookie: authUrl.startsWith("https://"),
    }),
  );
}

export function withAuth(handler, { public: isPublic } = {}) {
  return async function authenticatedHandler(req, res) {
    if (!isPublic?.(req) && !(await authorized(req, res))) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return handler(req, res);
  };
}

export function withPageAuth(getProps) {
  return async function authenticatedPage(context) {
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
