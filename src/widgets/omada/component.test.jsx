// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("../../utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/omada/component", () => {
  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "omada", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders placeholders while loading and defaults fields to 4 visible blocks", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "omada", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    // Default fields do not include connectedSwitches, so Container filters it out.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("omada.connectedAp")).toBeInTheDocument();
    expect(screen.getByText("omada.activeUser")).toBeInTheDocument();
    expect(screen.getByText("omada.alerts")).toBeInTheDocument();
    expect(screen.getByText("omada.connectedGateways")).toBeInTheDocument();
    expect(screen.queryByText("omada.connectedSwitches")).toBeNull();

    // Values should be placeholders ("-") while loading.
    expect(screen.getAllByText("-")).toHaveLength(4);
  });

  it("renders values when loaded (formatted via common.number)", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        connectedAp: 1,
        activeUser: 2,
        alerts: 3,
        connectedGateways: 4,
        connectedSwitches: 5,
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "omada", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("5")).toBeNull(); // connectedSwitches filtered by default fields
  });
});
