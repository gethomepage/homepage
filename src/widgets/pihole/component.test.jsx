// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/pihole/component", () => {
  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "pihole", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders placeholders while loading and defaults fields (3 visible blocks)", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pihole", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    // Default fields are queries/blocked/gravity; blocked_percent is present in JSX but filtered out by Container.
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("pihole.queries")).toBeInTheDocument();
    expect(screen.getByText("pihole.blocked")).toBeInTheDocument();
    expect(screen.getByText("pihole.gravity")).toBeInTheDocument();
    expect(screen.queryByText("pihole.blocked_percent")).toBeNull();

    expect(screen.getAllByText("-")).toHaveLength(3);
  });

  it("renders values and appends percent to blocked when blocked_percent is not a field", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        ads_blocked_today: "5",
        ads_percentage_today: "12.345",
        dns_queries_today: "99",
        domains_being_blocked: "123",
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pihole", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);

    // common.number/common.percent are formatted by the test i18n stub in vitest.setup.js
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("5 (12.3)")).toBeInTheDocument();
  });

  it("renders blocked_percent as its own block when configured", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        ads_blocked_today: "5",
        ads_percentage_today: "12.345",
        dns_queries_today: "99",
        domains_being_blocked: "123",
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component
        service={{
          widget: { type: "pihole", url: "http://x", fields: ["queries", "blocked", "blocked_percent", "gravity"] },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("5")).toBeInTheDocument(); // blocked (no percent appended)
    expect(screen.getByText("12.3")).toBeInTheDocument(); // blocked_percent
  });
});
