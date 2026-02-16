import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cookieJar, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  cookieJar: {
    addCookieToJar: vi.fn(),
    setCookieHeader: vi.fn(),
  },
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));
vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));
vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));
vi.mock("utils/proxy/cookie-jar", () => cookieJar);
vi.mock("widgets/widgets", () => ({
  default: {
    openmediavault: {
      api: "{url}/rpc.php",
    },
  },
}));

import openmediavaultProxyHandler from "./proxy";

describe("widgets/openmediavault/proxy", () => {
  beforeEach(() => {
    httpProxy.mockReset();
    getServiceWidget.mockReset();
    vi.clearAllMocks();
  });

  it("returns 400 when the query is missing group or service", async () => {
    const req = { query: { service: "svc", index: "0" } };
    const res = createMockRes();

    await openmediavaultProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
    expect(getServiceWidget).not.toHaveBeenCalled();
  });

  it("returns 400 when the widget cannot be resolved", async () => {
    getServiceWidget.mockResolvedValue(null);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await openmediavaultProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 403 when the service type does not support RPC", async () => {
    getServiceWidget.mockResolvedValue({
      type: "not-openmediavault",
      url: "http://omv",
      username: "u",
      password: "p",
      method: "foo.bar",
    });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await openmediavaultProxyHandler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Service does not support RPC calls" });
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("returns an HTTP error when the RPC call fails", async () => {
    getServiceWidget.mockResolvedValue({
      type: "openmediavault",
      url: "http://omv",
      username: "u",
      password: "p",
      method: "foo.bar",
    });

    httpProxy.mockResolvedValueOnce([500, "application/json", Buffer.from("nope"), {}]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await openmediavaultProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "HTTP Error 500",
          url: expect.any(URL),
          data: expect.any(Buffer),
        }),
      }),
    );
  });

  it("logs in after a 401 and retries the RPC call", async () => {
    getServiceWidget.mockResolvedValue({
      type: "openmediavault",
      url: "http://omv",
      username: "u",
      password: "p",
      method: "foo.bar",
    });

    httpProxy
      // initial rpc unauthorized
      .mockResolvedValueOnce([401, "application/json", Buffer.from(JSON.stringify({ response: {} })), {}])
      // login rpc
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ response: { authenticated: true } })),
        { "set-cookie": ["sid=1"] },
      ])
      // retry rpc
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ response: { ok: true } })), {}]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await openmediavaultProxyHandler(req, res);

    expect(cookieJar.setCookieHeader).toHaveBeenCalled();
    expect(cookieJar.addCookieToJar).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from(JSON.stringify({ response: { ok: true } })));
  });

  it("returns after a failed login attempt (non-200 response)", async () => {
    getServiceWidget.mockResolvedValue({
      type: "openmediavault",
      url: "http://omv",
      username: "u",
      password: "p",
      method: "foo.bar",
    });

    httpProxy
      // initial rpc unauthorized
      .mockResolvedValueOnce([401, "application/json", Buffer.from(JSON.stringify({ response: {} })), {}])
      // login rpc fails
      .mockResolvedValueOnce([500, "application/json", Buffer.from("nope"), {}]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await openmediavaultProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "HTTP Error 500",
        }),
      }),
    );
    expect(cookieJar.addCookieToJar).not.toHaveBeenCalled();
    expect(httpProxy).toHaveBeenCalledTimes(2);
  });

  it("returns after a failed login attempt (not authenticated)", async () => {
    getServiceWidget.mockResolvedValue({
      type: "openmediavault",
      url: "http://omv",
      username: "u",
      password: "p",
      method: "foo.bar",
    });

    httpProxy
      // initial rpc unauthorized
      .mockResolvedValueOnce([401, "application/json", Buffer.from(JSON.stringify({ response: {} })), {}])
      // login rpc returns authenticated false
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ response: { authenticated: false } })),
        {},
      ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await openmediavaultProxyHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "HTTP Error 401",
        }),
      }),
    );
    expect(cookieJar.addCookieToJar).not.toHaveBeenCalled();
    expect(httpProxy).toHaveBeenCalledTimes(2);
  });

  it("handles background methods by polling for output", async () => {
    getServiceWidget.mockResolvedValue({
      type: "openmediavault",
      url: "http://omv",
      username: "u",
      password: "p",
      method: "foo.barBg",
    });

    httpProxy
      // initial rpc returns filename for Bg output
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ response: "bg-1" })), {}])
      // exec.getOutput returns ready output
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ response: { running: false, outputPending: false, pos: 0, output: "ok" } })),
        {},
      ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await openmediavaultProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      Buffer.from(JSON.stringify({ response: { running: false, outputPending: false, pos: 0, output: "ok" } })),
    );
  });

  it("polls until background output is ready", async () => {
    vi.useFakeTimers();

    getServiceWidget.mockResolvedValue({
      type: "openmediavault",
      url: "http://omv",
      username: "u",
      password: "p",
      method: "foo.barBg",
    });

    httpProxy
      // initial rpc returns filename for Bg output
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ response: "bg-2" })), {}])
      // running: true -> triggers poll sleep and retry
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ response: { running: true, outputPending: true, pos: 1 } })),
        {},
      ])
      // second poll completes
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ response: { running: false, outputPending: false, pos: 2, output: "done" } })),
        {},
      ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    const promise = openmediavaultProxyHandler(req, res);
    await vi.runAllTimersAsync();
    await promise;

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      Buffer.from(JSON.stringify({ response: { running: false, outputPending: false, pos: 2, output: "done" } })),
    );

    vi.useRealTimers();
  });
});
