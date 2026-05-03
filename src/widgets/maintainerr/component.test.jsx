// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/maintainerr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
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

  it("renders storage metrics when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        cleanupTotals: {
          itemsHandled: 10,
          episodesHandled: 6,
          moviesHandled: 4,
          showsHandled: 2,
          seasonsHandled: 3,
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

    expectBlockValue(container, "maintainerr.itemsHandled", 10);
    expectBlockValue(container, "maintainerr.episodesHandled", 6);
    expectBlockValue(container, "maintainerr.moviesHandled", 4);
    expectBlockValue(container, "maintainerr.reclaimable", 1_500_000_000);
    expect(screen.queryByText("maintainerr.showsHandled")).toBeNull();
    expect(screen.queryByText("maintainerr.movieReclaimable")).toBeNull();
  });

  it("respects configured fields, including optional fields outside the defaults", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        cleanupTotals: {
          itemsHandled: 10,
          episodesHandled: 6,
          moviesHandled: 4,
          showsHandled: 2,
        },
        collectionSummary: {
          activeSizeBytes: 1_500_000_000,
          movieSizeBytes: 1_000_000_000,
        },
        totals: {
          totalSpace: 2_000_000_000,
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component
        service={{ widget: { type: "maintainerr", fields: ["showsHandled", "movieReclaimable", "totalCapacity"] } }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expectBlockValue(container, "maintainerr.showsHandled", 2);
    expectBlockValue(container, "maintainerr.movieReclaimable", 1_000_000_000);
    expectBlockValue(container, "maintainerr.totalCapacity", 2_000_000_000);
    expect(screen.queryByText("maintainerr.itemsHandled")).toBeNull();
    expect(screen.queryByText("maintainerr.episodesHandled")).toBeNull();
  });

  it("limits configured fields to the first 4", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        cleanupTotals: {
          itemsHandled: 10,
          episodesHandled: 6,
          moviesHandled: 4,
          showsHandled: 2,
          seasonsHandled: 3,
        },
        collectionSummary: {
          activeSizeBytes: 1_500_000_000,
          movieSizeBytes: 1_000_000_000,
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component
        service={{
          widget: {
            type: "maintainerr",
            fields: ["itemsHandled", "episodesHandled", "moviesHandled", "showsHandled", "seasonsHandled"],
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "maintainerr.itemsHandled", 10);
    expectBlockValue(container, "maintainerr.episodesHandled", 6);
    expectBlockValue(container, "maintainerr.moviesHandled", 4);
    expectBlockValue(container, "maintainerr.showsHandled", 2);
    expect(screen.queryByText("maintainerr.seasonsHandled")).toBeNull();
  });

  it("shows error UI when the widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "maintainerr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("nope")).toBeInTheDocument();
  });
});
