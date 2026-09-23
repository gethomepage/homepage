import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: {
    debug: vi.fn(),
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

import feedProxyHandler from "./proxy";

const items = Array.from(
  { length: 7 },
  (_, i) => `<item><title>Item ${i}</title><link>https://example.com/${i}</link>
    <media:thumbnail url="https://example.com/${i}.jpg" /></item>`,
).join("");
const feed = `<rss xmlns:media="http://search.yahoo.com/mrss/"><channel>${items}</channel></rss>`;

const req = { query: { group: "g", service: "svc", index: "0" } };

describe("widgets/feed/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when the url is missing or invalid", async () => {
    getServiceWidget.mockResolvedValueOnce({ type: "feed" });
    let res = createMockRes();
    await feedProxyHandler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing feed URL" });

    getServiceWidget.mockResolvedValueOnce({ type: "feed", url: "nope" });
    res = createMockRes();
    await feedProxyHandler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid feed URL" });
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("returns the first 5 items by default", async () => {
    getServiceWidget.mockResolvedValue({ type: "feed", url: "https://example.com/feed.xml" });
    httpProxy.mockResolvedValueOnce([200, "application/rss+xml", Buffer.from(feed)]);

    const res = createMockRes();
    await feedProxyHandler(req, res);

    expect(httpProxy.mock.calls[0][0].href).toBe("https://example.com/feed.xml");
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.items[0]).toEqual({
      title: "Item 0",
      link: "https://example.com/0",
      date: null,
      image: "https://example.com/0.jpg",
    });
  });

  it("respects maxItems and drops images when disabled", async () => {
    getServiceWidget.mockResolvedValue({
      type: "feed",
      url: "https://example.com/feed.xml",
      maxItems: "2",
      images: false,
    });
    httpProxy.mockResolvedValueOnce([200, "application/rss+xml", Buffer.from(feed)]);

    const res = createMockRes();
    await feedProxyHandler(req, res);

    expect(res.body.items).toEqual([
      { title: "Item 0", link: "https://example.com/0", date: null },
      { title: "Item 1", link: "https://example.com/1", date: null },
    ]);
  });

  it("passes through http errors without leaking the url", async () => {
    getServiceWidget.mockResolvedValue({ type: "feed", url: "https://example.com/feed.xml?token=secret" });
    httpProxy.mockResolvedValueOnce([404, "text/html", Buffer.from("Not found")]);

    const res = createMockRes();
    await feedProxyHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: { message: "HTTP Error", url: "example.com (see logs for details)" } });
  });

  it("returns 500 for unparseable feeds", async () => {
    getServiceWidget.mockResolvedValue({ type: "feed", url: "https://example.com/feed.xml" });
    httpProxy.mockResolvedValueOnce([200, "text/html", Buffer.from("<html></html>")]);

    const res = createMockRes();
    await feedProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: { message: "Invalid feed", url: "example.com (see logs for details)" } });
  });
});
