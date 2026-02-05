// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/jellyfin/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders CountBlocks placeholders while loading when enableBlocks is true", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined, mutate: vi.fn() }) // sessions
      .mockReturnValueOnce({ data: undefined, error: undefined }); // count

    renderWithProviders(
      <Component
        service={{
          widget: { type: "jellyfin", url: "http://x", enableBlocks: true },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("jellyfin.movies")).toBeInTheDocument();
    expect(screen.getByText("jellyfin.series")).toBeInTheDocument();
    expect(screen.getByText("jellyfin.episodes")).toBeInTheDocument();
    expect(screen.getByText("jellyfin.songs")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("renders the no-active message when there are no playing sessions", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: [], error: undefined, mutate: vi.fn() }) // sessions
      .mockReturnValueOnce({
        data: { MovieCount: 1, SeriesCount: 2, EpisodeCount: 3, SongCount: 4 },
        error: undefined,
      }); // count

    renderWithProviders(
      <Component
        service={{
          widget: { type: "jellyfin", url: "http://x", enableBlocks: true },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("jellyfin.no_active")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders a single now-playing entry (expanded to two rows by default)", () => {
    useWidgetAPI
      .mockReturnValueOnce({
        data: [
          {
            Id: "s1",
            UserName: "u1",
            NowPlayingItem: { Name: "Movie1", Type: "Movie", RunTimeTicks: 600000000 },
            PlayState: { PositionTicks: 0, IsPaused: false, IsMuted: false },
            TranscodingInfo: { IsVideoDirect: true },
          },
        ],
        error: undefined,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: { MovieCount: 0, SeriesCount: 0, EpisodeCount: 0, SongCount: 0 },
        error: undefined,
      });

    renderWithProviders(<Component service={{ widget: { type: "jellyfin", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("Movie1")).toBeInTheDocument();
    // Time strings are rendered in a combined node (e.g. "00:00/01:00").
    expect(screen.getByText(/00:00/)).toBeInTheDocument();
    expect(screen.getByText(/01:00/)).toBeInTheDocument();
  });
});
