import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cache, logger } = vi.hoisted(() => {
  const store = new Map();

  return {
    httpProxy: vi.fn(),
    getServiceWidget: vi.fn(),
    cache: {
      get: vi.fn((k) => store.get(k) ?? null),
      put: vi.fn((k, v) => store.set(k, v)),
      _reset: () => store.clear(),
    },
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("memory-cache", () => ({
  default: cache,
}));

vi.mock("widgets/widgets", () => ({
  default: {
    forgejo: {
      api: "{url}/api/v1/{endpoint}",
    },
  },
}));

import forgejoCommitsProxyHandler from "./proxy";

const reposResponse = (repos) =>
  Buffer.from(JSON.stringify({ ok: true, data: repos }));

function mockRepo(fullName, defaultBranch = "main") {
  return { full_name: fullName, default_branch: defaultBranch };
}

describe("widgets/forgejo/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("returns cached result when available", async () => {
    cache.put("forgejoCommitsProxyHandler__svc", { total_commits: 99 });

    getServiceWidget.mockResolvedValue({
      type: "forgejo",
      url: "http://forgejo",
      key: "token",
    });

    const req = { query: { group: "g", service: "svc", endpoint: "commits", index: "0" } };
    const res = createMockRes();

    await forgejoCommitsProxyHandler(req, res);

    expect(httpProxy).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ total_commits: 99 });
  });

  it("respects configurable commit-cache TTL", async () => {
    cache.put("forgejoCommitsProxyHandler__svc", { total_commits: 42 });

    getServiceWidget.mockResolvedValue({
      type: "forgejo",
      url: "http://forgejo",
      key: "token",
      "commit-cache": "30",
    });

    const req = { query: { group: "g", service: "svc", endpoint: "commits", index: "0" } };
    const res = createMockRes();

    await forgejoCommitsProxyHandler(req, res);

    // still served from cache
    expect(httpProxy).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ total_commits: 42 });
  });

  it("aggregates commits from multiple repos via x-total-count headers", async () => {
    getServiceWidget.mockResolvedValue({
      type: "forgejo",
      url: "http://forgejo",
      key: "token",
    });

    httpProxy
      // repos/search
      .mockResolvedValueOnce([
        200,
        "application/json",
        reposResponse([mockRepo("user/repo1"), mockRepo("user/repo2")]),
        { "x-total-count": "2" },
      ])
      // commits for repo1
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from("[]"),
        { "x-total-count": "150" },
      ])
      // commits for repo2
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from("[]"),
        { "x-total-count": "75" },
      ]);

    const req = { query: { group: "g", service: "svc", endpoint: "commits", index: "0" } };
    const res = createMockRes();

    await forgejoCommitsProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(res.json).toHaveBeenCalledWith({ total_commits: 225 });
  });

  it("uses default_branch from each repo as the sha parameter", async () => {
    getServiceWidget.mockResolvedValue({
      type: "forgejo",
      url: "http://forgejo",
      key: "token",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        reposResponse([mockRepo("user/repo", "develop")]),
        { "x-total-count": "1" },
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from("[]"),
        { "x-total-count": "42" },
      ]);

    const req = { query: { group: "g", service: "svc", endpoint: "commits", index: "0" } };
    const res = createMockRes();

    await forgejoCommitsProxyHandler(req, res);

    const commitsUrl = new URL(httpProxy.mock.calls[1][0]);
    expect(commitsUrl.searchParams.get("sha")).toBe("develop");
    expect(res.json).toHaveBeenCalledWith({ total_commits: 42 });
  });

  it("skips repos whose commits endpoint returns a non-200 status", async () => {
    getServiceWidget.mockResolvedValue({
      type: "forgejo",
      url: "http://forgejo",
      key: "token",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", reposResponse([mockRepo("user/ok"), mockRepo("user/fail")])])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("[]"), { "x-total-count": "10" }])
      .mockResolvedValueOnce([404, "application/json", Buffer.from("{}"), {}]);

    const req = { query: { group: "g", service: "svc", endpoint: "commits", index: "0" } };
    const res = createMockRes();

    await forgejoCommitsProxyHandler(req, res);

    expect(res.json).toHaveBeenCalledWith({ total_commits: 10 });
  });

  it("paginates repositories when pagination is enabled", async () => {
    getServiceWidget.mockResolvedValue({
      type: "forgejo",
      url: "http://forgejo",
      key: "token",
      pagination: "true",
    });

    const page1 = Array.from({ length: 50 }, (_, i) => mockRepo(`user/repo${i}`));
    const page2 = [mockRepo("user/repo50")];

    // repos/search page 1
    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      reposResponse(page1),
      { "x-total-count": "51" },
    ]);
    // repos/search page 2
    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      reposResponse(page2),
      { "x-total-count": "51" },
    ]);

    // one commit call per repo (50 + 1)
    for (let i = 0; i < 51; i += 1) {
      httpProxy.mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from("[]"),
        { "x-total-count": "1" },
      ]);
    }

    const req = { query: { group: "g", service: "svc", endpoint: "commits", index: "0" } };
    const res = createMockRes();

    await forgejoCommitsProxyHandler(req, res);

    // 2 repo search calls + 51 commit calls
    expect(httpProxy).toHaveBeenCalledTimes(53);
    expect(res.json).toHaveBeenCalledWith({ total_commits: 51 });
  });

  it("returns error when repos/search fails", async () => {
    getServiceWidget.mockResolvedValue({
      type: "forgejo",
      url: "http://forgejo",
      key: "token",
    });

    httpProxy.mockResolvedValueOnce([500, "application/json", Buffer.from("error")]);

    const req = { query: { group: "g", service: "svc", endpoint: "commits", index: "0" } };
    const res = createMockRes();

    await forgejoCommitsProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch repositories" });
  });

  it("handles missing group or service gracefully", async () => {
    const req = { query: { endpoint: "commits" } };
    const res = createMockRes();

    await forgejoCommitsProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid proxy service type" });
  });
});
