import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getSettings, cachedRequest, logger } = vi.hoisted(() => ({
  getSettings: vi.fn(),
  cachedRequest: vi.fn(),
  logger: { debug: vi.fn() },
}));

vi.mock("utils/config/config", () => ({
  getSettings,
}));

vi.mock("utils/proxy/http", () => ({
  cachedRequest,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import handler from "pages/api/widgets/stocks";

describe("pages/api/widgets/stocks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates watchlist and provider", async () => {
    const res1 = createMockRes();
    await handler({ query: {} }, res1);
    expect(res1.statusCode).toBe(400);

    const res2 = createMockRes();
    await handler({ query: { watchlist: "null", provider: "finnhub" } }, res2);
    expect(res2.statusCode).toBe(400);

    const res3 = createMockRes();
    await handler({ query: { watchlist: "AAPL,AAPL", provider: "finnhub" } }, res3);
    expect(res3.statusCode).toBe(400);
    expect(res3.body.error).toContain("duplicates");

    const res4 = createMockRes();
    await handler({ query: { watchlist: "AAPL", provider: "nope" } }, res4);
    expect(res4.statusCode).toBe(400);
    expect(res4.body.error).toContain("Invalid provider");
  });

  it("returns 400 when API key isn't configured for provider", async () => {
    getSettings.mockReturnValueOnce({ providers: {} });

    const req = { query: { watchlist: "AAPL", provider: "finnhub" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("API Key");
  });

  it("returns a normalized stocks response and rounds values", async () => {
    getSettings.mockReturnValueOnce({ providers: { finnhub: "k" } });

    cachedRequest
      .mockResolvedValueOnce({ c: 10.123, dp: -1.234 }) // AAPL
      .mockResolvedValueOnce({ c: null, dp: null }); // MSFT

    const req = { query: { watchlist: "AAPL,MSFT", provider: "finnhub", cache: "1" } };
    const res = createMockRes();

    await handler(req, res);

    expect(cachedRequest).toHaveBeenCalledWith("https://finnhub.io/api/v1/quote?symbol=AAPL&token=k", "1");
    expect(res.body).toEqual({
      stocks: [
        { ticker: "AAPL", currentPrice: "10.12", percentChange: -1.23 },
        { ticker: "MSFT", currentPrice: null, percentChange: null },
      ],
    });
  });
});
