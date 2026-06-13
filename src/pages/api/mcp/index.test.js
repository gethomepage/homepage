import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}));

vi.mock("next-auth/next", () => ({ getServerSession }));

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader: vi.fn((key, value) => {
      res.headers[key] = value;
    }),
    status: vi.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((body) => {
      res.body = body;
      return res;
    }),
    end: vi.fn((body) => {
      res.body = body;
      return res;
    }),
  };
  return res;
}

async function loadHandler() {
  vi.resetModules();
  return (await import("./index")).default;
}

describe("pages/api/mcp", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    getServerSession.mockReset();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 404 while disabled", async () => {
    delete process.env.HOMEPAGE_MCP_ENABLED;
    const handler = await loadHandler();
    const res = mockResponse();

    await handler({ method: "POST", headers: {}, body: { jsonrpc: "2.0", id: 1, method: "tools/list" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("requires bearer token when configured", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    process.env.HOMEPAGE_MCP_TOKEN = "secret";
    const handler = await loadHandler();
    const res = mockResponse();

    await handler({ method: "POST", headers: {}, body: { jsonrpc: "2.0", id: 1, method: "tools/list" } }, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("handles JSON-RPC requests when enabled and authorized", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    process.env.HOMEPAGE_MCP_TOKEN = "secret";
    const handler = await loadHandler();
    const res = mockResponse();

    await handler(
      {
        method: "POST",
        headers: { authorization: "Bearer secret" },
        body: { jsonrpc: "2.0", id: 1, method: "tools/list" },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body.result.tools.length).toBeGreaterThan(0);
  });

  it("allows requests with a NextAuth session when Homepage auth is enabled", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_PASSWORD = "password";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    getServerSession.mockResolvedValueOnce({ user: { name: "Homepage" } });
    const handler = await loadHandler();
    const res = mockResponse();

    await handler({ method: "POST", headers: {}, body: { jsonrpc: "2.0", id: 1, method: "tools/list" } }, res);

    expect(getServerSession).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body.result.tools.length).toBeGreaterThan(0);
  });

  it("rejects requests without a token or session when Homepage auth is enabled", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_PASSWORD = "password";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    getServerSession.mockResolvedValueOnce(null);
    const handler = await loadHandler();
    const res = mockResponse();

    await handler({ method: "POST", headers: {}, body: { jsonrpc: "2.0", id: 1, method: "tools/list" } }, res);

    expect(getServerSession).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("allows bearer token requests when Homepage auth is enabled", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_PASSWORD = "password";
    process.env.HOMEPAGE_AUTH_SECRET = "auth-secret";
    process.env.HOMEPAGE_MCP_TOKEN = "secret";
    const handler = await loadHandler();
    const res = mockResponse();

    await handler(
      {
        method: "POST",
        headers: { authorization: "Bearer secret" },
        body: { jsonrpc: "2.0", id: 1, method: "tools/list" },
      },
      res,
    );

    expect(getServerSession).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 202 for JSON-RPC notifications", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    const handler = await loadHandler();
    const res = mockResponse();

    await handler({ method: "POST", headers: {}, body: { jsonrpc: "2.0", method: "notifications/initialized" } }, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.end).toHaveBeenCalledWith();
  });

  it("rejects non-POST requests", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    const handler = await loadHandler();
    const res = mockResponse();

    await handler({ method: "GET", headers: {}, body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.setHeader).toHaveBeenCalledWith("Allow", "POST");
  });
});
