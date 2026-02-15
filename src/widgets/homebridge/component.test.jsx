// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/homebridge/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "homebridge", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("widget.status")).toBeInTheDocument();
    expect(screen.getByText("homebridge.updates")).toBeInTheDocument();
    expect(screen.getByText("homebridge.child_bridges")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "homebridge", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders update status and child bridge summary when child bridges exist", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        status: "ok",
        updateAvailable: true,
        plugins: { updatesAvailable: 0 },
        childBridges: { total: 2, running: 1 },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "homebridge", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("homebridge.ok")).toBeInTheDocument();
    expect(screen.getByText("homebridge.update_available")).toBeInTheDocument();
    // key is returned by the i18n mock; presence indicates the conditional block is rendered.
    expect(screen.getByText("homebridge.child_bridges_status")).toBeInTheDocument();
  });
});
