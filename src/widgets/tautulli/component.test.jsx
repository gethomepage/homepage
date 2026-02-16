// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/tautulli/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholder rows while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tautulli" } }} />, { settings: { hideErrors: false } });

    // Default behavior shows 2 placeholder rows, but just assert we see at least one.
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("renders no-active message when there are no sessions", () => {
    useWidgetAPI.mockReturnValue({
      data: { response: { data: { sessions: [] } } },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tautulli" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("tautulli.no_active")).toBeInTheDocument();
  });

  it("renders an expanded two-row entry when a single session is playing", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        response: {
          data: {
            sessions: [
              {
                session_key: "1",
                full_title: "Movie",
                media_type: "movie",
                duration: 2000,
                view_offset: 1000,
                progress_percent: 50,
                state: "playing",
                video_decision: "direct play",
                audio_decision: "direct play",
              },
            ],
          },
        },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tautulli" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Movie")).toBeInTheDocument();
    // view_offset 1s => "00:01", duration 2s => "00:02"
    expect(screen.getByText(/00:01/)).toBeInTheDocument();
    expect(screen.getByText(/00:02/)).toBeInTheDocument();
  });
});
