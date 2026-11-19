import { afterEach, describe, expect, it, vi } from "vitest";

import dashboardFetcher from "./dashboard-fetcher";

describe("utils/dashboard-fetcher", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects non-OK responses without parsing the body", async () => {
    const json = vi.fn(async () => ({ title: "Unauthorized" }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 401, json })),
    );

    await expect(dashboardFetcher("/api/widgets")).rejects.toThrow("status 401");
    expect(json).not.toHaveBeenCalled();
  });

  it("returns parsed JSON for OK responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, status: 200, json: async () => [{ type: "search" }] })),
    );

    await expect(dashboardFetcher("/api/widgets")).resolves.toEqual([{ type: "search" }]);
  });
});
