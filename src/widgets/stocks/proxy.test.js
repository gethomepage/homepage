import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getSettings, getServiceWidget, httpProxy, validateWidgetData, logger } = vi.hoisted(() => ({
  getSettings: vi.fn(() => ({ providers: { adanos: "adanos-token", finnhub: "finnhub-token" } })),
  getServiceWidget: vi.fn(),
  httpProxy: vi.fn(),
  validateWidgetData: vi.fn(() => true),
  logger: { debug: vi.fn(), error: vi.fn() },
}));

vi.mock("utils/config/config", () => ({ getSettings }));
vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));
vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("utils/proxy/validate-widget-data", () => ({ default: validateWidgetData }));
vi.mock("utils/logger", () => ({ default: () => logger }));

import stocksProxyHandler from "./proxy";

describe("widgets/stocks/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSettings.mockReturnValue({ providers: { adanos: "adanos-token", finnhub: "finnhub-token" } });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);
    validateWidgetData.mockReturnValue(true);
  });

  it("returns 400 when the endpoint is missing", async () => {
    const res = createMockRes();

    await stocksProxyHandler({ method: "GET", query: { group: "g", service: "s", index: 0 } }, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("endpoint");
    expect(getServiceWidget).not.toHaveBeenCalled();
  });

  it("proxies Finnhub quote requests with the configured Finnhub token", async () => {
    getServiceWidget.mockResolvedValue({ type: "stocks", provider: "finnhub" });
    const res = createMockRes();

    await stocksProxyHandler(
      { method: "GET", query: { group: "g", service: "s", endpoint: "v1/quote?symbol=AAPL", index: 0 } },
      res,
    );

    const [url, params] = httpProxy.mock.calls[0];
    expect(url.toString()).toBe("https://finnhub.io/api/v1/quote?symbol=AAPL");
    expect(params.headers["X-Finnhub-Token"]).toBe("finnhub-token");
    expect(res.statusCode).toBe(200);
  });

  it("proxies Adanos sentiment requests with the configured Adanos token", async () => {
    getServiceWidget.mockResolvedValue({ type: "stocks", sentimentSource: "news_stocks" });
    const res = createMockRes();

    await stocksProxyHandler(
      { method: "GET", query: { group: "g", service: "s", endpoint: "compare?tickers=AAPL,NVDA&days=7", index: 0 } },
      res,
    );

    const [url, params] = httpProxy.mock.calls[0];
    expect(url.toString()).toBe("https://api.adanos.org/news/stocks/v1/compare?tickers=AAPL,NVDA&days=7");
    expect(params.headers["X-API-Key"]).toBe("adanos-token");
    expect(res.statusCode).toBe(200);
  });

  it("defaults Adanos sentiment requests to the Reddit stocks source", async () => {
    getServiceWidget.mockResolvedValue({ type: "stocks" });
    const res = createMockRes();

    await stocksProxyHandler(
      { method: "GET", query: { group: "g", service: "s", endpoint: "compare?tickers=AAPL", index: 0 } },
      res,
    );

    const [url] = httpProxy.mock.calls[0];
    expect(url.toString()).toBe("https://api.adanos.org/reddit/stocks/v1/compare?tickers=AAPL");
    expect(res.statusCode).toBe(200);
  });

  it("returns 400 when the service widget cannot be found", async () => {
    getServiceWidget.mockResolvedValue(null);
    const res = createMockRes();

    await stocksProxyHandler(
      { method: "GET", query: { group: "g", service: "s", endpoint: "compare?tickers=AAPL", index: 0 } },
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Invalid proxy service type");
    expect(logger.debug).toHaveBeenCalled();
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("returns 400 when the Adanos provider token is missing", async () => {
    getSettings.mockReturnValue({ providers: { finnhub: "finnhub-token" } });
    getServiceWidget.mockResolvedValue({ type: "stocks", sentimentSource: "reddit_stocks" });
    const res = createMockRes();

    await stocksProxyHandler(
      { method: "GET", query: { group: "g", service: "s", endpoint: "compare?tickers=AAPL", index: 0 } },
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("API Key");
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("returns 400 when the Adanos source is not supported", async () => {
    getServiceWidget.mockResolvedValue({ type: "stocks", sentimentSource: "reddit_crypto" });
    const res = createMockRes();

    await stocksProxyHandler(
      { method: "GET", query: { group: "g", service: "s", endpoint: "compare?tickers=BTC", index: 0 } },
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("source");
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("sanitizes downstream error urls and logs failed responses", async () => {
    getServiceWidget.mockResolvedValue({ type: "stocks", sentimentSource: "news_stocks" });
    httpProxy.mockResolvedValue([
      500,
      "application/json",
      { error: { url: "https://api.adanos.org/news/stocks/v1/compare?token=secret" } },
    ]);
    const res = createMockRes();

    await stocksProxyHandler(
      {
        method: "GET",
        query: { group: "g", service: "s", endpoint: "compare?tickers=AAPL&token=secret", index: 0 },
      },
      res,
    );

    expect(res.statusCode).toBe(500);
    expect(res.body.error.url).toBe("https://api.adanos.org/news/stocks/v1/compare?tickers=AAPL&token=***");
    expect(logger.error).toHaveBeenCalledWith("HTTP Error %d calling %s", 500, expect.any(String));
  });

  it("returns invalid data errors from widget validation", async () => {
    getServiceWidget.mockResolvedValue({ type: "stocks", sentimentSource: "news_stocks" });
    validateWidgetData.mockReturnValue(false);
    const res = createMockRes();

    await stocksProxyHandler(
      { method: "GET", query: { group: "g", service: "s", endpoint: "compare?tickers=AAPL", index: 0 } },
      res,
    );

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("Invalid data");
  });

  it("applies response maps when provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "stocks", sentimentSource: "news_stocks" });
    httpProxy.mockResolvedValue([200, undefined, { ok: true }]);
    const res = createMockRes();

    await stocksProxyHandler(
      { method: "GET", query: { group: "g", service: "s", endpoint: "compare?tickers=AAPL", index: 0 } },
      res,
      (data) => ({ ...data, mapped: true }),
    );

    expect(res.headers["Content-Type"]).toBeUndefined();
    expect(res.body).toEqual({ ok: true, mapped: true });
  });
});
