// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/tracearr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholder rows while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tracearr" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("renders no-active message when there are no streams", () => {
    useWidgetAPI.mockReturnValue({
      data: { data: [], summary: { total: 0, transcodes: 0, directPlays: 0, totalBitrate: "0 Mbps" } },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tracearr" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("tracearr.no_active")).toBeInTheDocument();
  });

  it("renders an expanded two-row entry when a single stream is playing", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            mediaTitle: "Inception",
            mediaType: "movie",
            durationMs: 7200000, // 2 hours
            progressMs: 2700000, // 45 minutes in
            state: "playing",
            videoDecision: "directplay",
            audioDecision: "directplay",
          },
        ],
        summary: { total: 1, transcodes: 0, directPlays: 1, totalBitrate: "20 Mbps" },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tracearr" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText(/45:00/)).toBeInTheDocument(); // 45 minutes in
    expect(screen.getByText(/02:00:00/)).toBeInTheDocument(); // 2 hour duration
  });

  it("renders multiple streams including movie and tv episode", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            mediaTitle: "Inception",
            mediaType: "movie",
            durationMs: 7200000, // 2 hours
            progressMs: 2700000, // 45 minutes in
            state: "playing",
            videoDecision: "directplay",
            audioDecision: "directplay",
          },
          {
            id: "2",
            mediaTitle: "Ozymandias",
            showTitle: "Breaking Bad",
            mediaType: "episode",
            seasonNumber: 5,
            episodeNumber: 14,
            durationMs: 2700000, // 45 minutes
            progressMs: 1200000, // 20 minutes in
            state: "playing",
            videoDecision: "transcode",
            audioDecision: "directplay",
            username: "Walter",
          },
        ],
        summary: { total: 2, transcodes: 1, directPlays: 1, totalBitrate: "35 Mbps" },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tracearr" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("Breaking Bad - Ozymandias")).toBeInTheDocument();
  });

  it("renders summary view when view option is set to summary", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [],
        summary: { total: 5, transcodes: 2, directPlays: 3, totalBitrate: "45 Mbps" },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tracearr", view: "summary" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("tracearr.streams")).toBeInTheDocument();
    expect(screen.getByText("tracearr.bitrate")).toBeInTheDocument();
  });
});
