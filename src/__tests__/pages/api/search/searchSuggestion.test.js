import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { providers, getSettings, widgetsFromConfig, cachedRequest } = vi.hoisted(() => ({
  providers: {
    custom: { name: "Custom", url: false, suggestionUrl: null },
    google: { name: "Google", url: "https://google?q=", suggestionUrl: "https://google/suggest?q=" },
    empty: { name: "NoSuggest", url: "x", suggestionUrl: null },
  },
  getSettings: vi.fn(),
  widgetsFromConfig: vi.fn(),
  cachedRequest: vi.fn(),
}));

vi.mock("components/widgets/search/search", () => ({
  searchProviders: {
    custom: providers.custom,
    google: providers.google,
    empty: providers.empty,
  },
}));

vi.mock("utils/config/config", () => ({
  getSettings,
}));

vi.mock("utils/config/widget-helpers", () => ({
  widgetsFromConfig,
}));

vi.mock("utils/proxy/http", () => ({
  cachedRequest,
}));

import handler from "pages/api/search/searchSuggestion";

describe("pages/api/search/searchSuggestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset provider objects since handler mutates the Custom provider.
    providers.custom.url = false;
    providers.custom.suggestionUrl = null;
  });

  it("returns empty suggestions when providerName is unknown", async () => {
    const req = { query: { query: "hello", providerName: "Unknown" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual(["hello", []]);
  });

  it("returns empty suggestions when provider has no suggestionUrl", async () => {
    const req = { query: { query: "hello", providerName: "NoSuggest" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual(["hello", []]);
  });

  it("calls cachedRequest for a standard provider", async () => {
    cachedRequest.mockResolvedValueOnce(["q", ["a"]]);

    const req = { query: { query: "hello world", providerName: "Google" } };
    const res = createMockRes();

    await handler(req, res);

    expect(cachedRequest).toHaveBeenCalledWith("https://google/suggest?q=hello%20world", 5, "Mozilla/5.0");
    expect(res.body).toEqual(["q", ["a"]]);
  });

  it("resolves Custom provider suggestionUrl from widgets.yaml when present", async () => {
    widgetsFromConfig.mockResolvedValueOnce([
      { type: "search", options: { url: "https://custom?q=", suggestionUrl: "https://custom/suggest?q=" } },
    ]);
    cachedRequest.mockResolvedValueOnce(["q", ["x"]]);

    const req = { query: { query: "hello", providerName: "Custom" } };
    const res = createMockRes();

    await handler(req, res);

    expect(cachedRequest).toHaveBeenCalledWith("https://custom/suggest?q=hello", 5, "Mozilla/5.0");
    expect(res.body).toEqual(["q", ["x"]]);
  });

  it("falls back to quicklaunch custom settings when no search widget is configured", async () => {
    widgetsFromConfig.mockResolvedValueOnce([]);
    getSettings.mockReturnValueOnce({
      quicklaunch: { provider: "custom", url: "https://ql?q=", suggestionUrl: "https://ql/suggest?q=" },
    });
    cachedRequest.mockResolvedValueOnce(["q", ["y"]]);

    const req = { query: { query: "hello", providerName: "Custom" } };
    const res = createMockRes();

    await handler(req, res);

    expect(cachedRequest).toHaveBeenCalledWith("https://ql/suggest?q=hello", 5, "Mozilla/5.0");
  });
});
