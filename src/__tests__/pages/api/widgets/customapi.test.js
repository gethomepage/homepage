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

describe("pages/api/widgets/customapi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when the widget URL is missing", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});
    const res = createMockRes();

    await handler({ query: { index: "0" } }, res);

    expect(getPrivateWidgetOptions).toHaveBeenCalledWith("customapi", "0");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing Custom API URL");
  });

  it("returns 400 when the widget URL is invalid", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "not a url" });
    const res = createMockRes();

    await handler({ query: { index: "0" } }, res);

    expect(res.statusCode).toBe(400);
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("proxies with headers, basic auth, method and JSON body", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({
      url: "http://api.local/data",
      username: "u",
      password: "p",
      method: "POST",
      headers: { "X-Test": "1" },
      requestBody: { foo: "bar" },
    });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from('{"a":1}')]);
    const res = createMockRes();

    await handler({ query: { index: "0" } }, res);

    expect(httpProxy).toHaveBeenCalledWith(new URL("http://api.local/data"), {
      method: "POST",
      headers: { "X-Test": "1", Authorization: `Basic ${Buffer.from("u:p").toString("base64")}` },
      body: '{"foo":"bar"}',
    });
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
    expect(res.statusCode).toBe(200);
    expect(res.body.toString()).toBe('{"a":1}');
  });

  it("defaults to GET and passes string bodies through", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "http://api.local", requestBody: "raw" });
    httpProxy.mockResolvedValueOnce([200, null, Buffer.from("{}")]);
    const res = createMockRes();

    await handler({ query: { index: "0" } }, res);

    expect(httpProxy).toHaveBeenCalledWith(expect.any(URL), { method: "GET", headers: {}, body: "raw" });
  });

  it("returns a sanitized error without upstream data on HTTP errors", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "http://api.local/secret?token=abc" });
    httpProxy.mockResolvedValueOnce([500, "text/plain", Buffer.from("boom")]);
    const res = createMockRes();

    await handler({ query: { index: "0" } }, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: { message: "HTTP Error", url: "api.local (see logs for details)" } });
  });
});
