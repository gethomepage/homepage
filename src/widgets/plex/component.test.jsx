// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/plex/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "plex" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("plex.streams")).toBeInTheDocument();
    expect(screen.getByText("plex.albums")).toBeInTheDocument();
    expect(screen.getByText("plex.movies")).toBeInTheDocument();
    expect(screen.getByText("plex.tv")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "plex" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders plex unified counts when loaded", () => {
    useWidgetAPI.mockReturnValue({ data: { streams: 1, albums: 2, movies: 3, tv: 4 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "plex" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "plex.streams", 1);
    expectBlockValue(container, "plex.albums", 2);
    expectBlockValue(container, "plex.movies", 3);
    expectBlockValue(container, "plex.tv", 4);
  });
});
