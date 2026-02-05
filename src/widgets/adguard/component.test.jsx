// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/adguard/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "adguard" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("adguard.queries")).toBeInTheDocument();
    expect(screen.getByText("adguard.blocked")).toBeInTheDocument();
    expect(screen.getByText("adguard.filtered")).toBeInTheDocument();
    expect(screen.getByText("adguard.latency")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "adguard" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders computed filtered and latency values", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        num_dns_queries: 100,
        num_blocked_filtering: 20,
        num_replaced_safebrowsing: 1,
        num_replaced_safesearch: 2,
        num_replaced_parental: 3,
        avg_processing_time: 0.01,
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "adguard" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument(); // filtered sum
    expect(screen.getByText("10")).toBeInTheDocument(); // 0.01s -> 10ms
  });
});
