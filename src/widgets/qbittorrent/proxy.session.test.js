import { createServer } from "node:http";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getServiceWidget, logger } = vi.hoisted(() => ({
  getServiceWidget: vi.fn(),
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

import qbittorrentProxyHandler from "./proxy";

// Integration test using the real httpProxy and cookie jar against a mock
// qBittorrent server, so session cookie handling across login/retry is exercised.
describe("widgets/qbittorrent/proxy session cookies", () => {
  let server;
  let validSid = null;
  let sidCounter = 0;

  const getSid = (req) => /SID=([^;]+)/.exec(req.headers.cookie ?? "")?.[1];

  beforeAll(async () => {
    server = createServer((req, res) => {
      if (req.method === "POST" && req.url === "/api/v2/auth/login") {
        sidCounter += 1;
        validSid = `sid-${sidCounter}`;
        res.writeHead(200, { "Set-Cookie": `SID=${validSid}; HttpOnly; path=/`, "Content-Type": "text/plain" });
        res.end("Ok.");
        return;
      }

      if (req.method === "GET" && req.url === "/api/v2/torrents/info") {
        if (validSid && getSid(req) === validSid) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end("[]");
          return;
        }
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Forbidden");
        return;
      }

      res.writeHead(404);
      res.end();
    });

    await new Promise((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });

    getServiceWidget.mockResolvedValue({
      type: "qbittorrent",
      url: `http://127.0.0.1:${server.address().port}`,
      username: "user",
      password: "pass",
    });
  });

  afterAll(() => {
    server.close();
  });

  const callHandler = async () => {
    const req = { query: { group: "g", service: "svc", endpoint: "torrents/info", index: "0" } };
    const res = createMockRes();
    await qbittorrentProxyHandler(req, res);
    return res;
  };

  it("logs in and returns data when no session exists yet", async () => {
    const res = await callHandler();
    expect(res.statusCode).toBe(200);
  });

  it("recovers when the cached session cookie has expired server-side", async () => {
    // session died server-side (timeout/restart) but the jar still holds the old cookie
    validSid = null;

    const res = await callHandler();
    expect(res.statusCode).toBe(200);
  });
});
