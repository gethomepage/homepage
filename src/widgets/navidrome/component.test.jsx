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

  function mockWidgetAPI({ nowPlayingData, nowPlayingError, libraryStats, libraryStatsError }) {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "libraryStats") return { data: libraryStats, error: libraryStatsError };
      return { data: nowPlayingData, error: nowPlayingError };
    });
  }

  it("renders a waiting row while loading", () => {
    mockWidgetAPI({});

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("navidrome.please_wait")).toBeInTheDocument();
    expect(screen.getByText("navidrome.playlists")).toBeInTheDocument();
    expect(screen.getByText("navidrome.artists")).toBeInTheDocument();
    expect(screen.getByText("navidrome.albums")).toBeInTheDocument();
    expect(screen.getByText("navidrome.songs")).toBeInTheDocument();
  });

  it("renders an error container when the API errors", () => {
    mockWidgetAPI({ nowPlayingError: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders now playing entries when present", () => {
    mockWidgetAPI({
      nowPlayingData: {
        "subsonic-response": {
          nowPlaying: {
            entry: {
              0: { id: "a", title: "Song", artist: "Artist", album: "Album", username: "user" },
            },
          },
        },
      },
      libraryStats: { playlists: 1, artists: 2, albums: 3, songs: 4 },
    });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Artist - Song — Album (user)")).toBeInTheDocument();
    expect(screen.getByText("navidrome.playlists")).toBeInTheDocument();
    expect(screen.getByText("navidrome.artists")).toBeInTheDocument();
    expect(screen.getByText("navidrome.albums")).toBeInTheDocument();
    expect(screen.getByText("navidrome.songs")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders a single-object now playing entry", () => {
    mockWidgetAPI({
      nowPlayingData: {
        "subsonic-response": {
          nowPlaying: {
            entry: { id: "a", title: "Song", artist: "Artist" },
          },
        },
      },
      libraryStats: { playlists: 1, artists: 2, albums: 3, songs: 4 },
    });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Artist - Song")).toBeInTheDocument();
  });

  it("renders array now playing entries without ids", () => {
    mockWidgetAPI({
      nowPlayingData: {
        "subsonic-response": {
          nowPlaying: {
            entry: [{ title: "First Song" }, { title: "Second Song", album: "Second Album", username: "listener" }],
          },
        },
      },
      libraryStats: { playlists: 1, artists: 2, albums: 3, songs: 4 },
    });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("First Song")).toBeInTheDocument();
    expect(screen.getByText("Second Song — Second Album (listener)")).toBeInTheDocument();
  });

  it("renders now playing entries with fallback labels and keys", () => {
    mockWidgetAPI({
      nowPlayingData: {
        "subsonic-response": {
          nowPlaying: {
            entry: [{ artist: "First Artist" }, { album: "Second Album" }, { username: "listener" }],
          },
        },
      },
      libraryStats: {},
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("First Artist - undefined")).toBeInTheDocument();
    expect(screen.getByText("undefined — Second Album")).toBeInTheDocument();
    expect(screen.getByText("undefined (listener)")).toBeInTheDocument();
    expect(container).toHaveTextContent("navidrome.artists");
  });

  it("renders a Subsonic error container when the payload contains an error", () => {
    mockWidgetAPI({
      nowPlayingData: {
        "subsonic-response": {
          error: { message: "Wrong username or password" },
        },
      },
    });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Wrong username or password")).toBeInTheDocument();
  });

  it("renders library counts with no active streams", () => {
    mockWidgetAPI({
      nowPlayingData: {
        "subsonic-response": {
          nowPlaying: {},
        },
      },
      libraryStats: { playlists: 1, artists: 2, albums: 3, songs: 4 },
    });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("navidrome.nothing_streaming")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders no active streams when now playing payload is missing", () => {
    mockWidgetAPI({
      nowPlayingData: {
        "subsonic-response": {},
      },
      libraryStats: { playlists: 1, artists: 2, albums: 3, songs: 4 },
    });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("navidrome.nothing_streaming")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders safe placeholders for missing library counts", () => {
    mockWidgetAPI({
      nowPlayingData: {
        "subsonic-response": {
          nowPlaying: {},
        },
      },
      libraryStats: { playlists: 1, albums: null, songs: 4 },
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(container).not.toHaveTextContent("undefined");
    expect(container).not.toHaveTextContent("NaN");
  });

  it("preserves now playing output when library stats error", () => {
    mockWidgetAPI({
      nowPlayingData: {
        "subsonic-response": {
          nowPlaying: {
            entry: { id: "a", title: "Song", artist: "Artist" },
          },
        },
      },
      libraryStatsError: { message: "stats failed" },
    });

    renderWithProviders(<Component service={{ widget: { type: "navidrome" } }} />, { settings: { hideErrors: false } });

    expect(screen.queryByText(/widget\.api_error/i)).not.toBeInTheDocument();
    expect(screen.queryByText("stats failed")).not.toBeInTheDocument();
    expect(screen.getByText("Artist - Song")).toBeInTheDocument();
  });
});
