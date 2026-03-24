import { beforeEach, describe, expect, it, vi } from "vitest";

const { httpProxy } = vi.hoisted(() => ({ httpProxy: vi.fn() }));
const { getServiceWidget } = vi.hoisted(() => ({ getServiceWidget: vi.fn() }));

vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));

import cloudflaredProxyHandler from "./proxy";

function mockReq(query = {}) {
  return { query: { group: "Cloudflare", service: "Tunnels", index: 0, ...query } };
}

function mockRes() {
  const res = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
    end: vi.fn(() => res),
  };
  return res;
}

describe("widgets/cloudflared/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when widget config is missing", async () => {
    getServiceWidget.mockResolvedValue(null);
    const res = mockRes();

    await cloudflaredProxyHandler(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("calls single tunnel endpoint when tunnelid is present", async () => {
    getServiceWidget.mockResolvedValue({
      accountid: "abc123",
      tunnelid: "tunnel-1",
      key: "token-xyz",
    });

    httpProxy.mockResolvedValue([
      200,
      "application/json",
      JSON.stringify({
        result: {
          status: "healthy",
          connections: [{ origin_ip: "1.2.3.4" }],
        },
      }),
    ]);

    const res = mockRes();
    await cloudflaredProxyHandler(mockReq(), res);

    expect(httpProxy).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/abc123/cfd_tunnel/tunnel-1",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-xyz",
        }),
      }),
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mode: "single",
      status: "healthy",
      origin_ip: "1.2.3.4",
    });
  });

  it("returns origin_ip from connections object", async () => {
    getServiceWidget.mockResolvedValue({
      accountid: "abc123",
      tunnelid: "tunnel-1",
      key: "token-xyz",
    });

    httpProxy.mockResolvedValue([
      200,
      "application/json",
      JSON.stringify({
        result: {
          status: "healthy",
          connections: { origin_ip: "5.6.7.8" },
        },
      }),
    ]);

    const res = mockRes();
    await cloudflaredProxyHandler(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith({
      mode: "single",
      status: "healthy",
      origin_ip: "5.6.7.8",
    });
  });

  it("returns null origin_ip when tunnel is down", async () => {
    getServiceWidget.mockResolvedValue({
      accountid: "abc123",
      tunnelid: "tunnel-1",
      key: "token-xyz",
    });

    httpProxy.mockResolvedValue([
      200,
      "application/json",
      JSON.stringify({
        result: { status: "down", connections: [] },
      }),
    ]);

    const res = mockRes();
    await cloudflaredProxyHandler(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith({
      mode: "single",
      status: "down",
      origin_ip: null,
    });
  });

  it("calls aggregate endpoint when tunnelid is absent", async () => {
    getServiceWidget.mockResolvedValue({
      accountid: "abc123",
      key: "token-xyz",
    });

    httpProxy.mockResolvedValue([
      200,
      "application/json",
      JSON.stringify({
        result: [
          { status: "healthy" },
          { status: "healthy" },
          { status: "down" },
        ],
      }),
    ]);

    const res = mockRes();
    await cloudflaredProxyHandler(mockReq(), res);

    expect(httpProxy).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/abc123/cfd_tunnel?is_deleted=false",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-xyz",
        }),
      }),
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mode: "aggregate",
      healthy: 2,
      unhealthy: 1,
      total: 3,
    });
  });

  it("forwards error status on aggregate API failure", async () => {
    getServiceWidget.mockResolvedValue({
      accountid: "abc123",
      key: "token-xyz",
    });

    httpProxy.mockResolvedValue([403, "text/plain", "Forbidden"]);

    const res = mockRes();
    await cloudflaredProxyHandler(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.end).toHaveBeenCalledWith("Forbidden");
  });

  it("forwards error status on single tunnel API failure", async () => {
    getServiceWidget.mockResolvedValue({
      accountid: "abc123",
      tunnelid: "tunnel-1",
      key: "token-xyz",
    });

    httpProxy.mockResolvedValue([502, "text/plain", "Bad Gateway"]);

    const res = mockRes();
    await cloudflaredProxyHandler(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.end).toHaveBeenCalledWith("Bad Gateway");
  });
});
