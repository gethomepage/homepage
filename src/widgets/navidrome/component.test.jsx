// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/navidrome/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a waiting row while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("navidrome.please_wait")).toBeInTheDocument();
  });

  it("renders library block placeholders while loading when enableBlocks is true", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "navidrome", enableBlocks: true } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("navidrome.songs")).toBeInTheDocument();
    expect(screen.getByText("navidrome.albums")).toBeInTheDocument();
    expect(screen.getByText("navidrome.artists")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("renders an error container when the API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders now playing entries when present", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        "subsonic-response": {
          nowPlaying: {
            entry: {
              0: { id: "a", title: "Song", artist: "Artist", album: "Album", username: "user" },
            },
          },
        },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Artist - Song — Album (user)")).toBeInTheDocument();
  });

  it("renders library totals when enableBlocks is true and now playing is disabled", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({
        data: { totalSongs: 461, totalAlbums: 411, totalArtists: 304 },
        error: undefined,
      });

    renderWithProviders(
      <Component service={{ widget: { type: "navidrome", enableBlocks: true, enableNowPlaying: false } }} />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("461")).toBeInTheDocument();
    expect(screen.getByText("411")).toBeInTheDocument();
    expect(screen.getByText("304")).toBeInTheDocument();
  });
});
