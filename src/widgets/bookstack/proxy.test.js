import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
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

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("widgets/widgets", () => ({
  default: {
    bookstack: {
      api: "{url}/{endpoint}",
    },
  },
}));

import bookstackProxyHandler from "./proxy";

const AUTH = "Token id-1:secret-1";

function mockList(resource, total) {
  const url = `http://bookstack.example/api/${resource}?count=1`;
  const call = httpProxy.mock.calls.find(([requestUrl]) => requestUrl === url);
  expect(call).toBeTruthy();
  expect(call[1].headers.Authorization).toBe(AUTH);
  return total;
}

describe("widgets/bookstack/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServiceWidget.mockResolvedValue({
      type: "bookstack",
      url: "http://bookstack.example/",
      tokenId: "id-1",
      tokenSecret: "secret-1",
    });
  });

  it("fetches all four list endpoints in parallel with Token auth and count=1", async () => {
    httpProxy.mockImplementation(async (url) => {
      const resource = String(url).split("/api/")[1].split("?")[0];
      const totals = { shelves: 2, books: 5, chapters: 9, pages: 21 };
      return [200, "application/json", Buffer.from(JSON.stringify({ data: [{}], total: totals[resource] }))];
    });

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await bookstackProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(4);
    expect(httpProxy.mock.calls.map(([url]) => url).sort()).toEqual([
      "http://bookstack.example/api/books?count=1",
      "http://bookstack.example/api/chapters?count=1",
      "http://bookstack.example/api/pages?count=1",
      "http://bookstack.example/api/shelves?count=1",
    ]);
    mockList("shelves", 2);
    mockList("books", 5);
    mockList("chapters", 9);
    mockList("pages", 21);
    expect(res.send).toHaveBeenCalledWith({ shelves: 2, books: 5, chapters: 9, pages: 21 });
  });

  it("returns the first failed list status", async () => {
    httpProxy.mockImplementation(async (url) => {
      if (String(url).includes("/api/chapters")) {
        return [
          401,
          "application/json",
          Buffer.from(JSON.stringify({ error: { message: "No authorization token found on the request" } })),
        ];
      }
      return [200, "application/json", Buffer.from(JSON.stringify({ data: [], total: 0 }))];
    });

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await bookstackProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 400 when token credentials are missing", async () => {
    getServiceWidget.mockResolvedValue({ type: "bookstack", url: "http://bookstack.example" });

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await bookstackProxyHandler(req, res);

    expect(httpProxy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
