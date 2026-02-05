import { beforeEach, describe, expect, it, vi } from "vitest";

describe("utils/proxy/cookie-jar", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("adds cookies to the jar and sets Cookie header on subsequent requests", async () => {
    const { addCookieToJar, setCookieHeader } = await import("./cookie-jar");

    const url = new URL("http://example.test/path");
    addCookieToJar(url, { "set-cookie": ["a=b; Path=/"] });

    const params = { headers: {} };
    setCookieHeader(url, params);

    expect(params.headers.Cookie).toContain("a=b");
  });

  it("supports custom cookie header names via params.cookieHeader", async () => {
    const { addCookieToJar, setCookieHeader } = await import("./cookie-jar");

    const url = new URL("http://example2.test/path");
    addCookieToJar(url, { "set-cookie": ["sid=1; Path=/"] });

    const params = { headers: {}, cookieHeader: "X-Auth-Token" };
    setCookieHeader(url, params);

    expect(params.headers["X-Auth-Token"]).toContain("sid=1");
  });

  it("supports Headers instances passed as response headers", async () => {
    const { addCookieToJar, setCookieHeader } = await import("./cookie-jar");

    const url = new URL("http://example3.test/path");
    const headers = new Headers();
    headers.set("set-cookie", "c=d; Path=/");
    addCookieToJar(url, headers);

    const params = { headers: {} };
    setCookieHeader(url, params);

    expect(params.headers.Cookie).toContain("c=d");
  });
});
