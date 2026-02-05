import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { cachedRequest } = vi.hoisted(() => ({
  cachedRequest: vi.fn(),
}));

vi.mock("utils/proxy/http", () => ({
  cachedRequest,
}));

import handler from "pages/api/widgets/openmeteo";

describe("pages/api/widgets/openmeteo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the open-meteo URL with units + timezone and calls cachedRequest", async () => {
    cachedRequest.mockResolvedValueOnce({ ok: true });

    const req = {
      query: { latitude: "1", longitude: "2", units: "metric", cache: "5" },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(cachedRequest).toHaveBeenCalledWith(
      "https://api.open-meteo.com/v1/forecast?latitude=1&longitude=2&daily=sunrise,sunset&current_weather=true&temperature_unit=celsius&timezone=auto",
      "5",
    );
    expect(res.body).toEqual({ ok: true });
  });

  it("uses the provided timezone and fahrenheit for non-metric units", async () => {
    cachedRequest.mockResolvedValueOnce({ ok: true });

    const req = {
      query: { latitude: "1", longitude: "2", units: "imperial", cache: 1, timezone: "UTC" },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(cachedRequest).toHaveBeenCalledWith(
      "https://api.open-meteo.com/v1/forecast?latitude=1&longitude=2&daily=sunrise,sunset&current_weather=true&temperature_unit=fahrenheit&timezone=UTC",
      1,
    );
  });
});
