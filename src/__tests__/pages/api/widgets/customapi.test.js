import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getPrivateWidgetOptions, httpProxy, logger } = vi.hoisted(() => ({
  getPrivateWidgetOptions: vi.fn(),
  httpProxy: vi.fn(),
  logger: { debug: vi.fn() },
}));

vi.mock("utils/config/widget-helpers", () => ({
  getPrivateWidgetOptions,
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import handler from "pages/api/widgets/customapi";

const json = (body) => Buffer.from(JSON.stringify(body));

async function callRoute(options, index = "0") {
  getPrivateWidgetOptions.mockResolvedValueOnce(options);
  const res = createMockRes();
  await handler({ query: { index } }, res);
  return res;
}

describe("pages/api/widgets/customapi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["no widget at that index", undefined],
    ["a widget without a url", { method: "GET" }],
    ["an invalid url", { url: "api.local/data" }],
  ])("returns 400 without calling upstream for %s", async (_, options) => {
    const res = await callRoute(options, "3");

    expect(getPrivateWidgetOptions).toHaveBeenCalledWith("customapi", "3");
    expect(res.statusCode).toBe(400);
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("proxies an authenticated POST with custom headers and a JSON body", async () => {
    httpProxy.mockResolvedValueOnce([200, "application/json", json({ json: { hello: "world" } })]);

    const res = await callRoute({
      url: "https://httpbin.org/post",
      username: "admin",
      password: "hunter2",
      method: "POST",
      headers: { "X-Secret-Token": "super-secret", "Content-Type": "application/json" },
      requestBody: { hello: "world" },
    });

    expect(httpProxy).toHaveBeenCalledWith(new URL("https://httpbin.org/post"), {
      method: "POST",
      headers: {
        "User-Agent": "homepage",
        Accept: "application/json",
        "X-Secret-Token": "super-secret",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from("admin:hunter2").toString("base64")}`,
      },
      body: '{"hello":"world"}',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ json: { hello: "world" } });
  });

  it("sends a string body as-is and lets config override default headers", async () => {
    httpProxy.mockResolvedValueOnce([200, "application/json", json({ data: { viewer: { login: "shamoon" } } })]);
    const query = '{"query":"{ viewer { login } }"}';

    const res = await callRoute({
      url: "https://api.github.com/graphql",
      method: "POST",
      headers: { Authorization: "Bearer ghp_token", "User-Agent": "my-dashboard" },
      requestBody: query,
    });

    expect(httpProxy).toHaveBeenCalledWith(expect.any(URL), {
      method: "POST",
      headers: { "User-Agent": "my-dashboard", Accept: "application/json", Authorization: "Bearer ghp_token" },
      body: query,
    });
    expect(res.body).toEqual({ data: { viewer: { login: "shamoon" } } });
  });

  it.each([
    ["an HTTP error", [403, "application/json", json({ message: "API rate limit exceeded for 1.2.3.4" })]],
    [
      "a network failure",
      [500, "application/json", { error: { message: "connect ECONNREFUSED", rawError: { address: "10.0.0.5" } } }],
    ],
    ["a non-JSON response", [200, "text/html", Buffer.from("<html><body>Login</body></html>")]],
  ])("returns only a sanitized error for %s", async (_, upstream) => {
    httpProxy.mockResolvedValueOnce(upstream);

    const res = await callRoute({ url: "https://api.github.com/repos/gethomepage/homepage?token=abc" });

    expect(httpProxy).toHaveBeenCalledWith(expect.any(URL), {
      method: "GET",
      headers: { "User-Agent": "homepage", Accept: "application/json" },
    });
    expect(res.statusCode).toBe(upstream[0] === 200 ? 500 : upstream[0]);
    expect(res.body.error.url).toBe("api.github.com (see logs for details)");
    expect(JSON.stringify(res.body)).not.toMatch(/rate limit|ECONNREFUSED|10\.0\.0\.5|<html>|token=abc/);
    expect(res.setHeader).not.toHaveBeenCalled();
  });
});
