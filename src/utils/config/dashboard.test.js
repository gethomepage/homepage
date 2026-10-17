import { beforeEach, describe, expect, it, vi } from "vitest";

const { services, bookmarks, widgets, translations, settings, logger } = vi.hoisted(() => ({
  services: vi.fn(),
  bookmarks: vi.fn(),
  widgets: vi.fn(),
  translations: vi.fn(),
  settings: vi.fn(),
  logger: { error: vi.fn() },
}));
vi.mock("utils/config/api-response", () => ({
  servicesResponse: services,
  bookmarksResponse: bookmarks,
  widgetsResponse: widgets,
}));
vi.mock("utils/config/config", () => ({ getSettings: settings }));
vi.mock("next-i18next/pages/serverSideTranslations", () => ({ serverSideTranslations: translations }));
vi.mock("utils/logger", () => ({ default: () => logger }));

import { getDashboardData, invalidateDashboardData } from "utils/config/dashboard";

describe("dashboard data snapshot", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    invalidateDashboardData();
    services.mockResolvedValue([{ name: "private service" }]);
    bookmarks.mockResolvedValue([]);
    widgets.mockResolvedValue([]);
    translations.mockResolvedValue({ _nextI18Next: { initialLocale: "en" } });
    settings.mockReturnValue({ providers: { privateKey: "secret" }, title: "Dashboard" });
  });

  it("coalesces concurrent discovery and reuses the snapshot for later page loads", async () => {
    const results = await Promise.all(Array.from({ length: 10 }, () => getDashboardData()));
    const later = await getDashboardData();
    for (const loader of [services, bookmarks, widgets, translations, settings]) expect(loader).toHaveBeenCalledOnce();
    expect(results.every((result) => result === later)).toBe(true);
    expect(later.initialSettings).toEqual({ title: "Dashboard" });
    expect(later.fallback["/api/services"]).toEqual([{ name: "private service" }]);
  });

  it("refreshes configuration and discovery after invalidation", async () => {
    await getDashboardData();
    invalidateDashboardData();
    settings.mockReturnValue({ title: "Updated", language: "zh-CN" });
    const result = await getDashboardData();
    expect(services).toHaveBeenCalledTimes(2);
    expect(result.initialSettings.title).toBe("Updated");
    expect(translations).toHaveBeenLastCalledWith("zh-Hans");
  });

  it("retries after a failed load instead of caching an empty dashboard", async () => {
    services.mockRejectedValueOnce(new Error("discovery failed"));
    expect((await getDashboardData()).fallback["/api/services"]).toEqual([]);
    expect((await getDashboardData()).fallback["/api/services"]).toEqual([{ name: "private service" }]);
    expect(services).toHaveBeenCalledTimes(2);
  });

  it("does not let a stale failed load evict a newer snapshot", async () => {
    let reject;
    services.mockImplementationOnce(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail;
        }),
    );
    const stale = getDashboardData();
    invalidateDashboardData();
    const current = await getDashboardData();
    reject(new Error("old discovery failed"));
    await stale;
    expect(await getDashboardData()).toBe(current);
    expect(services).toHaveBeenCalledTimes(2);
  });
});
