// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function baseSession(overrides = {}) {
  return {
    Id: "s1",
    UserName: "Alice",
    NowPlayingItem: {
      Type: "Episode",
      Name: "Pilot",
      SeriesName: "Show",
      ParentIndexNumber: 1,
      IndexNumber: 2,
      RunTimeTicks: 100000000,
    },
    PlayState: { PositionTicks: 50000000, IsPaused: true, IsMuted: true },
    TranscodingInfo: { IsVideoDirect: true, VideoDecoderIsHardware: true, VideoEncoderIsHardware: true },
    ...overrides,
  };
}

describe("widgets/emby/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton when sessions/count are missing", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined, mutate: vi.fn() });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "emby", enableBlocks: true, enableNowPlaying: true } }} />,
      { settings: { hideErrors: false } },
    );

    // CountBlocks placeholders should be present.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("emby.movies")).toBeInTheDocument();
    expect(screen.getByText("emby.series")).toBeInTheDocument();
    expect(screen.getByText("emby.episodes")).toBeInTheDocument();
    expect(screen.getByText("emby.songs")).toBeInTheDocument();
  });

  it("renders single-session view with expanded two rows and stream title with user + episode number", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: [baseSession()], error: undefined, mutate: vi.fn() }) // Sessions
      .mockReturnValueOnce({
        data: { MovieCount: 1, SeriesCount: 2, EpisodeCount: 3, SongCount: 4 },
        error: undefined,
      }); // Count

    renderWithProviders(
      <Component
        service={{
          widget: {
            type: "emby",
            enableBlocks: true,
            enableNowPlaying: true,
            enableUser: true,
            showEpisodeNumber: true,
            expandOneStreamToTwoRows: true,
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("Show: S01 · E02 - Pilot (Alice)")).toBeInTheDocument();
    expect(screen.getByText(/00:05/)).toBeInTheDocument();
    expect(screen.getByText(/00:10/)).toBeInTheDocument();
  });

  it("renders no_active when there are no sessions playing", () => {
    useWidgetAPI
      .mockReturnValueOnce({
        data: [{ Id: "s2", PlayState: { PositionTicks: 0 }, UserName: "Bob" }],
        error: undefined,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: { MovieCount: 0, SeriesCount: 0, EpisodeCount: 0, SongCount: 0 },
        error: undefined,
      });

    renderWithProviders(
      <Component service={{ widget: { type: "emby", enableNowPlaying: true, enableBlocks: true } }} />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("emby.no_active")).toBeInTheDocument();
  });
});
