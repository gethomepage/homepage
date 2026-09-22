import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getPrivateWidgetOptions, httpProxy, logger } = vi.hoisted(() => ({
  getPrivateWidgetOptions: vi.fn(),
  httpProxy: vi.fn(),
  logger: { error: vi.fn() },
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

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing Custom API URL");
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("returns 400 when the widget URL is invalid", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "not a url" });

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid Custom API URL");
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("returns the parsed JSON body of the custom API", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "http://prometheus:9090/api/v1/query?query=up" });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ status: "success" }))]);

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(httpProxy).toHaveBeenCalledWith(
      new URL("http://prometheus:9090/api/v1/query?query=up"),
      expect.objectContaining({ method: "GET" }),
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "success" });
  });

  it("sends basic auth, custom headers, method and request body", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({
      url: "http://custom.api/endpoint",
      username: "u",
      password: "p",
      method: "POST",
      headers: { "X-API-Token": "token" },
      requestBody: { foo: "bar" },
    });
    httpProxy.mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ ok: true }))]);

    const req = { query: { index: "1" } };
    const res = createMockRes();

    await handler(req, res);

    expect(getPrivateWidgetOptions).toHaveBeenCalledWith("customapi", "1");
    expect(httpProxy).toHaveBeenCalledWith(
      new URL("http://custom.api/endpoint"),
      expect.objectContaining({
        method: "POST",
        headers: {
          "X-API-Token": "token",
          Authorization: `Basic ${Buffer.from("u:p").toString("base64")}`,
        },
        body: '{"foo":"bar"}',
      }),
    );
    expect(res.statusCode).toBe(200);
  });

  it("passes a string request body through unchanged", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({
      url: "http://custom.api/endpoint",
      requestBody: '{"foo":"bar"}',
    });
    httpProxy.mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ ok: true }))]);

    await handler({ query: { index: "0" } }, createMockRes());

    expect(httpProxy.mock.calls[0][1].body).toBe('{"foo":"bar"}');
  });

  it("returns 400 on a non-200 response without leaking the URL", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "http://custom.api/secret?token=shhh" });
    httpProxy.mockResolvedValueOnce([500, null, Buffer.from("nope")]);

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("HTTP 500");
    expect(res.body.error).not.toContain("token=shhh");
  });

  it("returns 400 when the response is not JSON", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "http://custom.api/endpoint" });
    httpProxy.mockResolvedValueOnce([200, "text/html", Buffer.from("<html></html>")]);

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Error getting data from");
  });
});
