import { beforeEach, describe, expect, it, vi } from "vitest";

const { nextAuthMock } = vi.hoisted(() => ({
  nextAuthMock: vi.fn((options) => ({ options })),
}));

vi.mock("next-auth", () => ({
  default: nextAuthMock,
}));

describe("pages/api/auth/[...nextauth]", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    nextAuthMock.mockClear();
    process.env = { ...originalEnv };
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.NEXTAUTH_URL;
  });

  it("configures no providers when auth is disabled", async () => {
    const mod = await import("pages/api/auth/[...nextauth]");

    expect(nextAuthMock).toHaveBeenCalledTimes(1);
    expect(mod.default.options.providers).toEqual([]);
    expect(mod.default.options.pages?.signIn).toBe("/auth/signin");
  });

  it("maps HOMEPAGE_AUTH_SECRET and HOMEPAGE_EXTERNAL_URL to NextAuth envs", async () => {
    process.env.HOMEPAGE_AUTH_SECRET = "secret";
    process.env.HOMEPAGE_EXTERNAL_URL = "https://homepage.example";

    const mod = await import("pages/api/auth/[...nextauth]");

    expect(process.env.NEXTAUTH_SECRET).toBe("secret");
    expect(process.env.NEXTAUTH_URL).toBe("https://homepage.example");
    expect(mod.default.options.secret).toBe("secret");
  });

  it("throws when auth is enabled but required settings are missing", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";

    await expect(import("pages/api/auth/[...nextauth]")).rejects.toThrow(
      /OIDC auth is enabled but required settings are missing/i,
    );
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
});
