import NextAuth from "next-auth";

const authEnabled = Boolean(process.env.HOMEPAGE_AUTH_ENABLED);
const issuer = process.env.HOMEPAGE_OIDC_ISSUER;
const clientId = process.env.HOMEPAGE_OIDC_CLIENT_ID;
const clientSecret = process.env.HOMEPAGE_OIDC_CLIENT_SECRET;
const homepageAuthSecret = process.env.HOMEPAGE_AUTH_SECRET;
const homepageExternalUrl = process.env.HOMEPAGE_EXTERNAL_URL;

// Map HOMEPAGE_* envs to what NextAuth expects
if (!process.env.NEXTAUTH_SECRET && homepageAuthSecret) {
  process.env.NEXTAUTH_SECRET = homepageAuthSecret;
}
if (!process.env.NEXTAUTH_URL && homepageExternalUrl) {
  process.env.NEXTAUTH_URL = homepageExternalUrl;
}

const defaultScope = process.env.HOMEPAGE_OIDC_SCOPE || "openid email profile";
const cleanedIssuer = issuer ? issuer.replace(/\/+$/, "") : issuer;

if (
  authEnabled &&
  (!issuer || !clientId || !clientSecret || !process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL)
) {
  throw new Error("OIDC auth is enabled but required settings are missing.");
}

let providers = [];
if (authEnabled) {
  providers = [
    {
      id: "homepage-oidc",
      name: process.env.HOMEPAGE_OIDC_NAME || "Homepage OIDC",
      type: "oauth",
      idToken: true,
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
}

export default NextAuth({
  providers,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  debug: true,
  logger: {
    error: (...args) => console.error("[nextauth][error]", ...args),
    warn: (...args) => console.warn("[nextauth][warn]", ...args),
    debug: (...args) => console.debug("[nextauth][debug]", ...args),
  },
  events: {
    signIn: async (message) => console.debug("[nextauth][event][signIn]", message),
    signOut: async (message) => console.debug("[nextauth][event][signOut]", message),
    error: async (message) => console.error("[nextauth][event][error]", message),
  },
});
