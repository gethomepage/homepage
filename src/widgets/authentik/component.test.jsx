// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const blocks = Array.from(container.querySelectorAll(".service-block"));
  const block = blocks.find((b) => b.textContent?.includes(label));
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/authentik/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "authentik", version: 2 } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("authentik.users")).toBeInTheDocument();
    expect(screen.getByText("authentik.loginsLast24H")).toBeInTheDocument();
    expect(screen.getByText("authentik.failedLoginsLast24H")).toBeInTheDocument();
  });

  it("computes v2 login/failed counts from action data", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "users") return { data: { pagination: { count: 10 } }, error: undefined };
      if (endpoint === "loginv2")
        return {
          data: [
            { action: "login", count: 2 },
            { action: "logout", count: 9 },
          ],
          error: undefined,
        };
      if (endpoint === "login_failedv2") return { data: [{ count: 3 }, { count: null }], error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "authentik", version: 2 } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expectBlockValue(container, "authentik.users", 10);
    expectBlockValue(container, "authentik.loginsLast24H", 2);
    expectBlockValue(container, "authentik.failedLoginsLast24H", 3);
  });

  it("computes v1 login/failed counts for entries within the last 24h window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-02T00:00:00Z"));

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const twentyFiveHoursAgo = now - 25 * 60 * 60 * 1000;

    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "users") return { data: { pagination: { count: 5 } }, error: undefined };
      if (endpoint === "login")
        return {
          data: [
            { x_cord: oneHourAgo, y_cord: 2 },
            { x_cord: twentyFiveHoursAgo, y_cord: 100 },
          ],
          error: undefined,
        };
      if (endpoint === "login_failed")
        return {
          data: [
            { x_cord: oneHourAgo, y_cord: 1 },
            { x_cord: twentyFiveHoursAgo, y_cord: 50 },
          ],
          error: undefined,
        };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "authentik", version: 1 } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expectBlockValue(container, "authentik.users", 5);
    expectBlockValue(container, "authentik.loginsLast24H", 2);
    expectBlockValue(container, "authentik.failedLoginsLast24H", 1);
  });
});
