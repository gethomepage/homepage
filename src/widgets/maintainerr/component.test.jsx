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

describe("widgets/maintainerr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders for the default fields while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "maintainerr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("maintainerr.itemsHandled")).toBeInTheDocument();
    expect(screen.getByText("maintainerr.episodesHandled")).toBeInTheDocument();
    expect(screen.getByText("maintainerr.moviesHandled")).toBeInTheDocument();
    expect(screen.getByText("maintainerr.reclaimable")).toBeInTheDocument();
  });

  it("renders the default storage metrics", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        cleanupTotals: {
          itemsHandled: 12,
          episodesHandled: 7,
          moviesHandled: 5,
        },
        collectionSummary: {
          activeSizeBytes: 1_500_000_000,
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "maintainerr" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "maintainerr.itemsHandled", 12);
    expectBlockValue(container, "maintainerr.episodesHandled", 7);
    expectBlockValue(container, "maintainerr.moviesHandled", 5);
    expectBlockValue(container, "maintainerr.reclaimable", 1_500_000_000);
  });

  it("renders configured optional fields", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        cleanupTotals: {
          showsHandled: 3,
          seasonsHandled: 8,
        },
        collectionSummary: {
          movieSizeBytes: 1_000_000_000,
        },
        totals: {
          totalSpace: 2_000_000_000,
        },
      },
      error: undefined,
    });

    const service = {
      widget: {
        type: "maintainerr",
        fields: ["showsHandled", "seasonsHandled", "movieReclaimable", "totalCapacity"],
      },
    };
    const { container } = renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "maintainerr.showsHandled", 3);
    expectBlockValue(container, "maintainerr.seasonsHandled", 8);
    expectBlockValue(container, "maintainerr.movieReclaimable", 1_000_000_000);
    expectBlockValue(container, "maintainerr.totalCapacity", 2_000_000_000);
  });

  it("limits configured fields to the first four", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = {
      widget: {
        type: "maintainerr",
        fields: ["itemsHandled", "episodesHandled", "moviesHandled", "showsHandled", "seasonsHandled"],
      },
    };
    const { container } = renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("maintainerr.showsHandled")).toBeInTheDocument();
    expect(screen.queryByText("maintainerr.seasonsHandled")).toBeNull();
  });

  it("renders zero for missing metrics", () => {
    useWidgetAPI.mockReturnValue({ data: {}, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "maintainerr" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "maintainerr.itemsHandled", 0);
    expectBlockValue(container, "maintainerr.episodesHandled", 0);
    expectBlockValue(container, "maintainerr.moviesHandled", 0);
    expectBlockValue(container, "maintainerr.reclaimable", 0);
  });

  it("renders the error state", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "boom" } });

    renderWithProviders(<Component service={{ widget: { type: "maintainerr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("boom")).toBeInTheDocument();
  });
});
