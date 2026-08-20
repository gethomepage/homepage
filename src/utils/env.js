export function isAuthEnabled() {
  return process.env.HOMEPAGE_AUTH_ENABLED === "true";
}

// Frozen at module load, so map them before anything imports it
export function applyNextAuthEnv() {
  if (!process.env.NEXTAUTH_SECRET && process.env.HOMEPAGE_AUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = process.env.HOMEPAGE_AUTH_SECRET;
  }
  if (!process.env.NEXTAUTH_URL && process.env.HOMEPAGE_EXTERNAL_URL) {
    process.env.NEXTAUTH_URL = process.env.HOMEPAGE_EXTERNAL_URL;
  }
}
