import { createHash, timingSafeEqual } from "node:crypto";

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { applyNextAuthEnv, isAuthEnabled } from "utils/env";
import createLogger from "utils/logger";

const MIN_AUTH_SECRET_LENGTH = 32;

const authEnabled = isAuthEnabled();
const issuer = process.env.HOMEPAGE_OIDC_ISSUER;
const clientId = process.env.HOMEPAGE_OIDC_CLIENT_ID;
const clientSecret = process.env.HOMEPAGE_OIDC_CLIENT_SECRET;
const homepageAuthPassword = process.env.HOMEPAGE_AUTH_PASSWORD;
const homepageAuthPasswordDigest = homepageAuthPassword
  ? createHash("sha256").update(homepageAuthPassword, "utf8").digest()
  : null;

// Also done in instrumentation.js
applyNextAuthEnv();

const defaultScope = process.env.HOMEPAGE_OIDC_SCOPE || "openid email profile";
const cleanedIssuer = issuer ? issuer.replace(/\/+$/, "") : issuer;
const hasOidcConfig = Boolean(issuer && clientId && clientSecret);
const hasAnyOidcConfig = Boolean(issuer || clientId || clientSecret);
let parsedAuthUrl;

if (authEnabled) {
  if (!process.env.NEXTAUTH_URL) {
    throw new Error("Homepage auth is enabled but HOMEPAGE_EXTERNAL_URL (or NEXTAUTH_URL) is missing.");
  }

  try {
    parsedAuthUrl = new URL(process.env.NEXTAUTH_URL);
  } catch {
    throw new Error("HOMEPAGE_EXTERNAL_URL (or NEXTAUTH_URL) must be an absolute HTTP(S) URL.");
  }

  if (
    !["http:", "https:"].includes(parsedAuthUrl.protocol) ||
    parsedAuthUrl.username ||
    parsedAuthUrl.password ||
    parsedAuthUrl.search ||
    parsedAuthUrl.hash
  ) {
    throw new Error(
      "HOMEPAGE_EXTERNAL_URL (or NEXTAUTH_URL) must be an absolute HTTP(S) URL without credentials, query, or fragment.",
    );
  }

  if (hasOidcConfig) {
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error("OIDC auth is enabled but required settings are missing.");
    }
  } else if (hasAnyOidcConfig) {
    throw new Error("OIDC auth is enabled but required settings are missing.");
  } else if (!homepageAuthPassword || !process.env.NEXTAUTH_SECRET) {
    throw new Error("Password auth is enabled but required settings are missing.");
  }

  if (process.env.NEXTAUTH_SECRET.length < MIN_AUTH_SECRET_LENGTH) {
    throw new Error(
      `HOMEPAGE_AUTH_SECRET (or NEXTAUTH_SECRET) must be at least ${MIN_AUTH_SECRET_LENGTH} characters. Generate one with: openssl rand -base64 32`,
    );
  }
}

// Give fail2ban / CrowdSec etc something to match on
function logFailedPasswordSignIn() {
  createLogger("nextauth").warn("Failed password sign-in attempt");
}

let providers = [];
if (authEnabled) {
  if (hasOidcConfig) {
    providers = [
      {
        id: "homepage-oidc",
        name: process.env.HOMEPAGE_OIDC_NAME || "Homepage OIDC",
        type: "oauth",
        idToken: true,
        checks: ["pkce", "state", "nonce"],
        issuer: cleanedIssuer,
        wellKnown: `${cleanedIssuer}/.well-known/openid-configuration`,
        clientId,
        clientSecret,
        authorization: {
          params: {
            scope: defaultScope,
          },
        },
        profile(profile) {
          return {
            id: profile.sub ?? profile.id ?? profile.user_id ?? profile.uid ?? profile.email,
            name: profile.name ?? profile.preferred_username ?? profile.nickname ?? profile.email,
            email: profile.email ?? null,
            image: profile.picture ?? null,
          };
        },
      },
    ];
  } else {
    providers = [
      CredentialsProvider({
        name: "Password",
        credentials: {
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const provided = credentials?.password;
          if (!homepageAuthPasswordDigest || typeof provided !== "string") {
            logFailedPasswordSignIn();
            return null;
          }
          const providedDigest = createHash("sha256").update(provided, "utf8").digest();
          const isMatch = timingSafeEqual(providedDigest, homepageAuthPasswordDigest);
          if (!isMatch) {
            logFailedPasswordSignIn();
            return null;
          }
          return {
            id: "homepage",
            name: "Homepage",
          };
        },
      }),
    ];
  }
}

export const authOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: parsedAuthUrl?.protocol === "https:",
  pages: {
    signIn: "/auth/signin",
  },
  logger: {
    error: (code) => createLogger("nextauth").error("%s", code),
    warn: (code) => createLogger("nextauth").warn("%s", code),
    debug: (code) => createLogger("nextauth").debug("%s", code),
  },
  events: {
    signIn: async ({ account }) =>
      createLogger("nextauth").debug("Sign in via provider '%s'", account?.provider ?? "unknown"),
    signOut: async () => createLogger("nextauth").debug("Sign out"),
  },
};

const nextAuthHandler = NextAuth(authOptions);

export default async function handler(req, res) {
  // Just pass empty session if auth not enabled
  if (!authEnabled) {
    return res.status(200).json({});
  }

  return nextAuthHandler(req, res);
}
