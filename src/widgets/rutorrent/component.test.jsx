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

describe("widgets/rutorrent/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "rutorrent" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("rutorrent.active")).toBeInTheDocument();
    expect(screen.getByText("rutorrent.upload")).toBeInTheDocument();
    expect(screen.getByText("rutorrent.download")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "rutorrent" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders computed active/upload/download values", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        { "d.get_state": "1", "d.get_up_rate": "10", "d.get_down_rate": "5" },
        { "d.get_state": "0", "d.get_up_rate": "20", "d.get_down_rate": "15" },
        { "d.get_state": "1", "d.get_up_rate": "0", "d.get_down_rate": "0" },
      ],
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "rutorrent" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("2")).toBeInTheDocument(); // active torrents
    expect(screen.getByText("30")).toBeInTheDocument(); // upload sum (common.byterate mocked)
    expect(screen.getByText("20")).toBeInTheDocument(); // download sum (common.byterate mocked)
  });
});
