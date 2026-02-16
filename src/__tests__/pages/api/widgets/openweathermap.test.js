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

import handler from "pages/api/widgets/openweathermap";

describe("pages/api/widgets/openweathermap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when no API key and no provider are supplied", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});

    const req = { query: { latitude: "1", longitude: "2", units: "metric", lang: "en", index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing API key or provider" });
  });

  it("returns 400 when provider doesn't match endpoint and no per-widget key exists", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});

    const req = { query: { latitude: "1", longitude: "2", units: "metric", lang: "en", provider: "weatherapi" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid provider for endpoint" });
  });

  it("uses key from widget options when present", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ apiKey: "from-widget" });
    cachedRequest.mockResolvedValueOnce({ ok: true });

    const req = {
      query: { latitude: "1", longitude: "2", units: "metric", lang: "en", cache: "1", index: "2" },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(getPrivateWidgetOptions).toHaveBeenCalledWith("openweathermap", "2");
    expect(cachedRequest).toHaveBeenCalledWith(
      "https://api.openweathermap.org/data/2.5/weather?lat=1&lon=2&appid=from-widget&units=metric&lang=en",
      "1",
    );
    expect(res.body).toEqual({ ok: true });
  });

  it("falls back to settings provider key when provider=openweathermap", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});
    getSettings.mockReturnValueOnce({ providers: { openweathermap: "from-settings" } });
    cachedRequest.mockResolvedValueOnce({ ok: true });

    const req = {
      query: {
        latitude: "1",
        longitude: "2",
        units: "imperial",
        lang: "en",
        provider: "openweathermap",
        cache: 2,
        index: "0",
      },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(cachedRequest).toHaveBeenCalledWith(
      "https://api.openweathermap.org/data/2.5/weather?lat=1&lon=2&appid=from-settings&units=imperial&lang=en",
      2,
    );
    expect(res.body).toEqual({ ok: true });
  });

  it("returns 400 when provider=openweathermap but settings do not provide an api key", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});
    getSettings.mockReturnValueOnce({ providers: {} });

    const req = {
      query: {
        latitude: "1",
        longitude: "2",
        units: "metric",
        lang: "en",
        provider: "openweathermap",
        cache: 1,
        index: "0",
      },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing API key" });
  });
});
