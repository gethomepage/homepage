import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: { debug: vi.fn(), error: vi.fn() },
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
vi.mock("widgets/widgets", () => ({
  default: {
    gitea: {
      api: "{url}/api/v1/{endpoint}?access_token={key}",
    },
  },
}));

import giteaProxyHandler from "./proxy";

function createReq(endpoint = "repos/issues/search?type=pulls&limit=1") {
  return { query: { group: "g", service: "svc", endpoint, index: "0" } };
}

describe("widgets/gitea/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServiceWidget.mockResolvedValue({ type: "gitea", url: "http://gitea", key: "tok" });
  });

  it("builds the URL with the endpoint query string and the access token", async () => {
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("[]"), { "x-total-count": "0" }]);

    const res = createMockRes();
    await giteaProxyHandler(createReq(), res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe(
      "http://gitea/api/v1/repos/issues/search?type=pulls&limit=1&access_token=tok",
    );
    expect(httpProxy.mock.calls[0][1]).toEqual({ method: "GET", headers: {} });
  });

  it("passes custom widget headers", async () => {
    getServiceWidget.mockResolvedValue({ type: "gitea", url: "http://gitea", key: "tok", headers: { "X-Foo": "bar" } });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("[]"), { "x-total-count": "0" }]);

    await giteaProxyHandler(createReq(), createMockRes());

    expect(httpProxy.mock.calls[0][1].headers).toEqual({ "X-Foo": "bar" });
  });

  it("returns the X-Total-Count header as count", async () => {
    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify([{ id: 1 }])),
      { "x-total-count": "1234" },
    ]);

    const res = createMockRes();
    await giteaProxyHandler(createReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ count: 1234 });
  });

  it("falls back to the array length when the header is missing", async () => {
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify([{ id: 1 }, { id: 2 }])), {}]);

    const res = createMockRes();
    await giteaProxyHandler(createReq("notifications?limit=1"), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ count: 2 });
  });

  it("falls back to data.length for repository search responses", async () => {
    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ ok: true, data: [{ id: 1 }, { id: 2 }, { id: 3 }] })),
      undefined,
    ]);

    const res = createMockRes();
    await giteaProxyHandler(createReq("repos/search?limit=1"), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ count: 3 });
  });

  it("falls back to 0 for unexpected payloads", async () => {
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ ok: true })), {}]);

    const res = createMockRes();
    await giteaProxyHandler(createReq(), res);

    expect(res.body).toEqual({ count: 0 });
  });

  it("returns a sanitized error for non-200 responses", async () => {
    httpProxy.mockResolvedValueOnce([401, "application/json", Buffer.from('{"message":"token is required"}'), {}]);

    const res = createMockRes();
    await giteaProxyHandler(createReq(), res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe("HTTP Error");
    expect(res.body.error.url).toBe("gitea (see logs for details)");
    expect(res.body.error.data).toBe('{"message":"token is required"}');
    expect(JSON.stringify(res.body)).not.toContain("tok&");
    expect(JSON.stringify(res.body)).not.toContain("access_token");
  });

  it("returns 400 when group or service is missing", async () => {
    const res = createMockRes();
    await giteaProxyHandler({ query: { service: "svc", endpoint: "notifications?limit=1" } }, res);

    expect(res.statusCode).toBe(400);
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("returns 400 when the widget is missing", async () => {
    getServiceWidget.mockResolvedValue(undefined);

    const res = createMockRes();
    await giteaProxyHandler(createReq(), res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
    expect(httpProxy).not.toHaveBeenCalled();
  });
});
