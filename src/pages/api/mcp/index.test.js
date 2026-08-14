import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, errorMock } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  errorMock: vi.fn(),
}));

vi.mock("next-auth/next", () => ({ getServerSession }));
vi.mock("utils/logger", () => ({ default: () => ({ error: errorMock, warn: vi.fn(), debug: vi.fn() }) }));

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
    errorMock.mockReset();
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
    process.env.HOMEPAGE_MCP_TOKEN = "mcp-tok-0123456789abcdefghijklmnopqrstuv";
    const handler = await loadHandler();
    const res = mockResponse();

    await handler({ method: "POST", headers: {}, body: { jsonrpc: "2.0", id: 1, method: "tools/list" } }, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("fails closed with 500 when the configured MCP token is too short", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    process.env.HOMEPAGE_MCP_TOKEN = "change-me";
    const handler = await loadHandler();
    const res = mockResponse();

    // even presenting the weak token verbatim must not authorize
    await handler(
      {
        method: "POST",
        headers: { authorization: "Bearer change-me" },
        body: { jsonrpc: "2.0", id: 1, method: "tools/list" },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(getServerSession).not.toHaveBeenCalled();
    expect(errorMock).toHaveBeenCalledWith(expect.stringContaining("at least 32 characters"));
  });

  it("rejects requests when neither Homepage auth nor an MCP token is configured", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    delete process.env.HOMEPAGE_AUTH_ENABLED;
    delete process.env.HOMEPAGE_MCP_TOKEN;
    const handler = await loadHandler();
    const res = mockResponse();

    await handler({ method: "POST", headers: {}, body: { jsonrpc: "2.0", id: 1, method: "tools/list" } }, res);

    expect(getServerSession).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("handles JSON-RPC requests when enabled and authorized", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    process.env.HOMEPAGE_MCP_TOKEN = "mcp-tok-0123456789abcdefghijklmnopqrstuv";
    const handler = await loadHandler();
    const res = mockResponse();

    await handler(
      {
        method: "POST",
        headers: { authorization: "Bearer mcp-tok-0123456789abcdefghijklmnopqrstuv" },
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
    process.env.HOMEPAGE_AUTH_SECRET = "rk3Xk9wQ0mVJt7cZbN2yLpA8sHdF4gRuEwTiOaSvBnM=";
    process.env.HOMEPAGE_EXTERNAL_URL = "https://homepage.example";
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
    process.env.HOMEPAGE_AUTH_SECRET = "rk3Xk9wQ0mVJt7cZbN2yLpA8sHdF4gRuEwTiOaSvBnM=";
    process.env.HOMEPAGE_EXTERNAL_URL = "https://homepage.example";
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
    process.env.HOMEPAGE_AUTH_SECRET = "rk3Xk9wQ0mVJt7cZbN2yLpA8sHdF4gRuEwTiOaSvBnM=";
    process.env.HOMEPAGE_EXTERNAL_URL = "https://homepage.example";
    process.env.HOMEPAGE_MCP_TOKEN = "mcp-tok-0123456789abcdefghijklmnopqrstuv";
    const handler = await loadHandler();
    const res = mockResponse();

    await handler(
      {
        method: "POST",
        headers: { authorization: "Bearer mcp-tok-0123456789abcdefghijklmnopqrstuv" },
        body: { jsonrpc: "2.0", id: 1, method: "tools/list" },
      },
      res,
    );

    expect(getServerSession).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 202 for JSON-RPC notifications", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    process.env.HOMEPAGE_MCP_TOKEN = "mcp-tok-0123456789abcdefghijklmnopqrstuv";
    const handler = await loadHandler();
    const res = mockResponse();

    await handler(
      {
        method: "POST",
        headers: { authorization: "Bearer mcp-tok-0123456789abcdefghijklmnopqrstuv" },
        body: { jsonrpc: "2.0", method: "notifications/initialized" },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.end).toHaveBeenCalledWith();
  });

  it("rejects non-POST requests", async () => {
    process.env.HOMEPAGE_MCP_ENABLED = "true";
    process.env.HOMEPAGE_MCP_TOKEN = "mcp-tok-0123456789abcdefghijklmnopqrstuv";
    const handler = await loadHandler();
    const res = mockResponse();

    await handler(
      { method: "GET", headers: { authorization: "Bearer mcp-tok-0123456789abcdefghijklmnopqrstuv" }, body: {} },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.setHeader).toHaveBeenCalledWith("Allow", "POST");
  });
});
