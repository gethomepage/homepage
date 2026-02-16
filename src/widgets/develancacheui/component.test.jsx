// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/develancacheui/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "develancacheui" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("develancacheui.cachehitbytes")).toBeInTheDocument();
    expect(screen.getByText("develancacheui.cachemissbytes")).toBeInTheDocument();
  });

  it("renders byte totals when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { totalCacheHitBytes: 100, totalCacheMissBytes: 200 },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "develancacheui" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });
});
