// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/atsumeru/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "atsumeru" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("atsumeru.series")).toBeInTheDocument();
    expect(screen.getByText("atsumeru.archives")).toBeInTheDocument();
    expect(screen.getByText("atsumeru.chapters")).toBeInTheDocument();
    expect(screen.getByText("atsumeru.categories")).toBeInTheDocument();
  });

  it("renders values when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { stats: { total_series: 1, total_archives: 2, total_chapters: 3, total_categories: 4 } },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "atsumeru" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
