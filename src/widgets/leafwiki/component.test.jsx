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

describe("widgets/leafwiki/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "leafwiki" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(1);
    expect(screen.getByText("leafwiki.pages")).toBeInTheDocument();
  });

  it("renders pages from pre-computed proxy data", () => {
    useWidgetAPI.mockReturnValue({
      data: { pages: 3},
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "leafwiki" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("3")).toBeInTheDocument(); // 3 pages
  });
});
