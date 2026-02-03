// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/jellystat/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults invalid days to 30 and renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "jellystat", days: -1 } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.days).toBe(30);
    expect(useWidgetAPI).toHaveBeenCalledWith(service.widget, "getViewsByLibraryType", { days: 30 });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("jellystat.songs")).toBeInTheDocument();
    expect(screen.getByText("jellystat.movies")).toBeInTheDocument();
    expect(screen.getByText("jellystat.episodes")).toBeInTheDocument();
    expect(screen.getByText("jellystat.other")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "jellystat", days: 7 } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders values when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { Audio: 1, Movie: 2, Series: 3, Other: 4 },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "jellystat", days: 7 } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
