// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/audiobookshelf/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "audiobookshelf" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("audiobookshelf.podcasts")).toBeInTheDocument();
    expect(screen.getByText("audiobookshelf.podcastsDuration")).toBeInTheDocument();
    expect(screen.getByText("audiobookshelf.books")).toBeInTheDocument();
    expect(screen.getByText("audiobookshelf.booksDuration")).toBeInTheDocument();
  });

  it("aggregates totals across libraries by mediaType", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        { mediaType: "podcast", stats: { totalItems: "2", totalDuration: "100" } },
        { mediaType: "podcast", stats: { totalItems: "1", totalDuration: "200" } },
        { mediaType: "book", stats: { totalItems: "4", totalDuration: "300" } },
      ],
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "audiobookshelf" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "audiobookshelf.podcasts", 3);
    expectBlockValue(container, "audiobookshelf.podcastsDuration", 300);
    expectBlockValue(container, "audiobookshelf.books", 4);
    expectBlockValue(container, "audiobookshelf.booksDuration", 300);
  });
});
