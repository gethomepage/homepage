export function isAuthEnabled() {
  return process.env.HOMEPAGE_AUTH_ENABLED === "true";
}
