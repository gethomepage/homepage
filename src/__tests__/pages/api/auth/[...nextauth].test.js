import { beforeEach, describe, expect, it, vi } from "vitest";

const { debugMock, errorMock, nextAuthMock, warnMock } = vi.hoisted(() => ({
  debugMock: vi.fn(),
  errorMock: vi.fn(),
  nextAuthMock: vi.fn((options) => ({ options })),
  warnMock: vi.fn(),
}));

vi.mock("next-auth", () => ({
  default: nextAuthMock,
}));

vi.mock("utils/logger", () => ({
  default: vi.fn(() => ({ debug: debugMock, error: errorMock, warn: warnMock })),
}));

describe("pages/api/auth/[...nextauth]", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    debugMock.mockClear();
    errorMock.mockClear();
    nextAuthMock.mockClear();
    warnMock.mockClear();
    process.env = { ...originalEnv };
    delete process.env.HOMEPAGE_EXTERNAL_URL;
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.NEXTAUTH_URL;
  });

  it("configures no providers when auth is disabled", async () => {
    const mod = await import("pages/api/auth/[...nextauth]");

    expect(nextAuthMock).toHaveBeenCalledTimes(1);
    expect(mod.default.options.providers).toEqual([]);
    expect(mod.default.options.pages?.signIn).toBe("/auth/signin");
  });

  it("does not enable NextAuth's raw debug logger", async () => {
    const mod = await import("pages/api/auth/[...nextauth]");

    expect(mod.default.options).not.toHaveProperty("debug");
  });

  it("routes sanitized NextAuth logs through the Homepage logger", async () => {
    const mod = await import("pages/api/auth/[...nextauth]");
    const sensitiveMetadata = {
      clientSecret: "sensitive-client-secret",
      access_token: "sensitive-access-token",
      id_token: "sensitive-id-token",
    };

    mod.default.options.logger.error("OAUTH_CALLBACK_ERROR", sensitiveMetadata);
    mod.default.options.logger.warn("NEXTAUTH_URL", sensitiveMetadata);
    mod.default.options.logger.debug("OAUTH_CALLBACK_RESPONSE", sensitiveMetadata);

    expect(errorMock).toHaveBeenCalledWith("%s", "OAUTH_CALLBACK_ERROR");
    expect(warnMock).toHaveBeenCalledWith("%s", "NEXTAUTH_URL");
    expect(debugMock).toHaveBeenCalledWith("%s", "OAUTH_CALLBACK_RESPONSE");
    expect(JSON.stringify([...errorMock.mock.calls, ...warnMock.mock.calls, ...debugMock.mock.calls])).not.toContain(
      "sensitive",
    );
  });

  it("logs only sanitized authentication lifecycle events", async () => {
    const mod = await import("pages/api/auth/[...nextauth]");

    await mod.default.options.events.signIn({
      account: {
        provider: "homepage-oidc",
        access_token: "sensitive-access-token",
        id_token: "sensitive-id-token",
      },
      user: { email: "sensitive@example.com" },
    });
    await mod.default.options.events.signOut({ token: { sub: "sensitive-user-id" } });

    expect(debugMock).toHaveBeenNthCalledWith(1, "Sign in via provider '%s'", "homepage-oidc");
    expect(debugMock).toHaveBeenNthCalledWith(2, "Sign out");
    expect(JSON.stringify(debugMock.mock.calls)).not.toContain("sensitive");
  });

  it("maps HOMEPAGE_AUTH_SECRET and HOMEPAGE_EXTERNAL_URL to NextAuth envs", async () => {
    process.env.HOMEPAGE_AUTH_SECRET = "secret";
    process.env.HOMEPAGE_EXTERNAL_URL = "https://homepage.example";

    const mod = await import("pages/api/auth/[...nextauth]");

    expect(process.env.NEXTAUTH_SECRET).toBe("secret");
    expect(process.env.NEXTAUTH_URL).toBe("https://homepage.example");
    expect(mod.default.options.secret).toBe("secret");
  });

  it("throws when auth is enabled without an external URL", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_PASSWORD = "secret";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";

    await expect(import("pages/api/auth/[...nextauth]")).rejects.toThrow(/HOMEPAGE_EXTERNAL_URL.*is missing/i);
  });

  it.each([
    "homepage.example",
    "ftp://homepage.example",
    "https://user:password@homepage.example",
    "https://homepage.example/?unexpected=true",
    "https://homepage.example/#unexpected",
  ])("rejects invalid external URL %s", async (externalUrl) => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_PASSWORD = "secret";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    process.env.HOMEPAGE_EXTERNAL_URL = externalUrl;

    await expect(import("pages/api/auth/[...nextauth]")).rejects.toThrow(/absolute HTTP\(S\) URL/i);
  });

  it("throws when auth is enabled but no provider settings are present", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    process.env.HOMEPAGE_EXTERNAL_URL = "https://homepage.example";

    await expect(import("pages/api/auth/[...nextauth]")).rejects.toThrow(
      /Password auth is enabled but required settings are missing/i,
    );
  });

  it("builds a password provider when auth is enabled without OIDC config", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_PASSWORD = "secret";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    process.env.HOMEPAGE_EXTERNAL_URL = "https://homepage.example";

    const mod = await import("pages/api/auth/[...nextauth]");
    const [provider] = mod.default.options.providers;

    expect(provider.id).toBe("credentials");
    expect(provider.name).toBe("Credentials");
    expect(provider.type).toBe("credentials");
    expect(typeof provider.authorize).toBe("function");
    expect(mod.default.options.useSecureCookies).toBe(true);
    await expect(provider.options.authorize({ password: "secret" })).resolves.toEqual({
      id: "homepage",
      name: "Homepage",
    });
    await expect(provider.options.authorize({ password: "wrong" })).resolves.toBeNull();
    await expect(provider.options.authorize({ password: 123 })).resolves.toBeNull();
  });

  it("compares multibyte passwords without throwing on unequal byte lengths", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_PASSWORD = "é";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    process.env.HOMEPAGE_EXTERNAL_URL = "https://homepage.example";

    const mod = await import("pages/api/auth/[...nextauth]");
    const [provider] = mod.default.options.providers;

    await expect(provider.options.authorize({ password: "a" })).resolves.toBeNull();
    await expect(provider.options.authorize({ password: "é" })).resolves.toEqual({
      id: "homepage",
      name: "Homepage",
    });
  });

  it("supports trusted HTTP deployments without Secure cookies", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_PASSWORD = "secret";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    process.env.HOMEPAGE_EXTERNAL_URL = "http://192.168.1.20:3000";

    const mod = await import("pages/api/auth/[...nextauth]");

    expect(process.env.NEXTAUTH_URL).toBe("http://192.168.1.20:3000");
    expect(mod.default.options.useSecureCookies).toBe(false);
  });

  it("accepts an explicitly configured NEXTAUTH_URL", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_PASSWORD = "secret";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    process.env.NEXTAUTH_URL = "https://homepage.example";

    const mod = await import("pages/api/auth/[...nextauth]");

    expect(mod.default.options.useSecureCookies).toBe(true);
  });

  it("builds an OIDC provider when enabled and maps profile fields", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_OIDC_ISSUER = "https://issuer.example/";
    process.env.HOMEPAGE_OIDC_CLIENT_ID = "client-id";
    process.env.HOMEPAGE_OIDC_CLIENT_SECRET = "client-secret";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    process.env.HOMEPAGE_EXTERNAL_URL = "https://homepage.example";
    process.env.HOMEPAGE_OIDC_NAME = "My OIDC";
    process.env.HOMEPAGE_OIDC_SCOPE = "openid email";

    const mod = await import("pages/api/auth/[...nextauth]");
    const [provider] = mod.default.options.providers;

    expect(provider).toMatchObject({
      id: "homepage-oidc",
      name: "My OIDC",
      type: "oauth",
      idToken: true,
      checks: ["pkce", "state"],
      issuer: "https://issuer.example",
      wellKnown: "https://issuer.example/.well-known/openid-configuration",
      clientId: "client-id",
      clientSecret: "client-secret",
    });
    expect(provider.authorization.params.scope).toBe("openid email");

    expect(
      provider.profile({
        sub: "sub",
        preferred_username: "user",
        email: "user@example.com",
        picture: "https://example.com/p.png",
      }),
    ).toEqual({
      id: "sub",
      name: "user",
      email: "user@example.com",
      image: "https://example.com/p.png",
    });

    expect(
      provider.profile({
        id: "id",
        name: "name",
      }),
    ).toEqual({
      id: "id",
      name: "name",
      email: null,
      image: null,
    });
  });

  it("throws when only partial OIDC settings are provided", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_OIDC_ISSUER = "https://issuer.example";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    process.env.HOMEPAGE_EXTERNAL_URL = "https://homepage.example";

    await expect(import("pages/api/auth/[...nextauth]")).rejects.toThrow(
      /OIDC auth is enabled but required settings are missing/i,
    );
  });
});
