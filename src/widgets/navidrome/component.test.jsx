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
});
