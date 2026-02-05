import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getSettings, getPrivateWidgetOptions, cachedRequest } = vi.hoisted(() => ({
  getSettings: vi.fn(),
  getPrivateWidgetOptions: vi.fn(),
  cachedRequest: vi.fn(),
}));

vi.mock("utils/config/config", () => ({
  getSettings,
}));

vi.mock("utils/config/widget-helpers", () => ({
  getPrivateWidgetOptions,
}));

vi.mock("utils/proxy/http", () => ({
  cachedRequest,
}));

import handler from "pages/api/widgets/weather";

describe("pages/api/widgets/weatherapi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when no API key and no provider are supplied", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});

    const req = { query: { latitude: "1", longitude: "2", lang: "en", index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing API key or provider" });
  });

  it("uses key from widget options when present", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ apiKey: "from-widget" });
    cachedRequest.mockResolvedValueOnce({ ok: true });

    const req = { query: { latitude: "1", longitude: "2", lang: "en", cache: 1, index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(cachedRequest).toHaveBeenCalledWith(
      "http://api.weatherapi.com/v1/current.json?q=1,2&key=from-widget&lang=en",
      1,
    );
    expect(res.body).toEqual({ ok: true });
  });

  it("falls back to settings provider key when provider=weatherapi", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});
    getSettings.mockReturnValueOnce({ providers: { weatherapi: "from-settings" } });
    cachedRequest.mockResolvedValueOnce({ ok: true });

    const req = { query: { latitude: "1", longitude: "2", lang: "en", provider: "weatherapi", cache: "2" } };
    const res = createMockRes();

    await handler(req, res);

    expect(cachedRequest).toHaveBeenCalledWith(
      "http://api.weatherapi.com/v1/current.json?q=1,2&key=from-settings&lang=en",
      "2",
    );
  });

  it("rejects unsupported providers", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});

    const req = { query: { latitude: "1", longitude: "2", lang: "en", provider: "nope" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid provider for endpoint" });
  });

  it("returns 400 when a provider is set but no API key can be resolved", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});
    getSettings.mockReturnValueOnce({ providers: {} });

    const req = { query: { latitude: "1", longitude: "2", lang: "en", provider: "weatherapi" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing API key" });
  });
});
