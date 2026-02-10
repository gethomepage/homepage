// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

vi.mock("react-icons/bs", () => ({
  BsCpu: (props) => <svg data-testid="BsCpu" {...props} />,
  BsFillCpuFill: (props) => <svg data-testid="BsFillCpuFill" {...props} />,
  BsFillPlayFill: (props) => <svg data-testid="BsFillPlayFill" {...props} />,
  BsPauseFill: (props) => <svg data-testid="BsPauseFill" {...props} />,
}));

vi.mock("react-icons/md", () => ({
  MdOutlineSmartDisplay: (props) => <svg data-testid="MdOutlineSmartDisplay" {...props} />,
  MdSmartDisplay: (props) => <svg data-testid="MdSmartDisplay" {...props} />,
}));

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

  it("renders placeholder blocks while loading in summary view", () => {
    useWidgetAPI.mockReturnValue({ data: { data: null }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tracearr", view: "summary" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("tracearr.streams")).toBeInTheDocument();
    expect(screen.getByText("tracearr.transcodes")).toBeInTheDocument();
    expect(screen.getByText("tracearr.directplay")).toBeInTheDocument();
    expect(screen.getByText("tracearr.bitrate")).toBeInTheDocument();
  });

  it("renders errors from the widget API", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "boom" } });

    renderWithProviders(<Component service={{ widget: { type: "tracearr" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText(/widget\.api_error\s+widget\.information/)).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
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

  it("uses 0% progress when duration is 0 in expanded view", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            mediaTitle: "Short Clip",
            mediaType: "movie",
            durationMs: 0,
            progressMs: 5000,
            state: "playing",
            videoDecision: "directplay",
            audioDecision: "directplay",
          },
        ],
        summary: { total: 1, transcodes: 0, directPlays: 1, totalBitrate: "1 Mbps" },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tracearr" } }} />, {
      settings: { hideErrors: false },
    });

    const bars = container.querySelectorAll('div[style*="width"]');
    expect(bars.length).toBeGreaterThan(0);
    expect(bars[0]).toHaveStyle({ width: "0%" });
  });

  it("renders episode title with season/episode and username when configured", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            id: "2",
            mediaTitle: "Ozymandias",
            showTitle: "Breaking Bad",
            mediaType: "episode",
            seasonNumber: 5,
            episodeNumber: 14,
            durationMs: 2700000,
            progressMs: 1200000,
            state: "playing",
            videoDecision: "directplay",
            audioDecision: "directplay",
            username: "Walter",
          },
        ],
        summary: { total: 1, transcodes: 0, directPlays: 1, totalBitrate: "10 Mbps" },
      },
      error: undefined,
    });

    renderWithProviders(
      <Component
        service={{
          widget: { type: "tracearr", enableUser: true, showEpisodeNumber: true, expandOneStreamToTwoRows: false },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("Breaking Bad: S05 · E14 - Ozymandias (Walter)")).toBeInTheDocument();
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

  it.each([
    ["copy/copy shows copy icon", { videoDecision: "copy", audioDecision: "copy" }, "MdOutlineSmartDisplay"],
    ["transcode shows cpu fill icon", { videoDecision: "transcode", audioDecision: "directplay" }, "BsFillCpuFill"],
    ["transcode+copy shows cpu fill icon", { videoDecision: "transcode", audioDecision: "copy" }, "BsFillCpuFill"],
    ["mixed transcode shows cpu icon", { videoDecision: "directplay", audioDecision: "transcode" }, "BsCpu"],
  ])("renders transcoding indicators in expanded view: %s", (_label, decisions, expectedIcon) => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            mediaTitle: "Inception",
            mediaType: "movie",
            durationMs: 7200000,
            progressMs: 2700000,
            state: "playing",
            ...decisions,
          },
        ],
        summary: { total: 1, transcodes: 0, directPlays: 1, totalBitrate: "20 Mbps" },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tracearr" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByTestId(expectedIcon)).toBeInTheDocument();
  });

  it("renders a pause icon when a stream is paused in expanded view", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            mediaTitle: "Inception",
            mediaType: "movie",
            durationMs: 7200000,
            progressMs: 2700000,
            state: "paused",
            videoDecision: "directplay",
            audioDecision: "directplay",
          },
        ],
        summary: { total: 1, transcodes: 0, directPlays: 1, totalBitrate: "20 Mbps" },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tracearr" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByTestId("BsPauseFill")).toBeInTheDocument();
  });

  it.each([
    ["copy/copy shows copy icon", { videoDecision: "copy", audioDecision: "copy" }, "MdOutlineSmartDisplay"],
    ["transcode shows cpu fill icon", { videoDecision: "transcode", audioDecision: "directplay" }, "BsFillCpuFill"],
    ["transcode+copy shows cpu fill icon", { videoDecision: "transcode", audioDecision: "copy" }, "BsFillCpuFill"],
    ["mixed transcode shows cpu icon", { videoDecision: "directplay", audioDecision: "transcode" }, "BsCpu"],
  ])("renders transcoding indicators in single-row view: %s", (_label, decisions, expectedIcon) => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            mediaTitle: "Inception",
            mediaType: "movie",
            durationMs: 7200000,
            progressMs: 2700000,
            state: "playing",
            ...decisions,
          },
        ],
        summary: { total: 1, transcodes: 0, directPlays: 1, totalBitrate: "20 Mbps" },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tracearr", expandOneStreamToTwoRows: false } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByTestId(expectedIcon)).toBeInTheDocument();
  });

  it("renders a pause icon when a stream is paused in single-row view", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            mediaTitle: "Inception",
            mediaType: "movie",
            durationMs: 7200000,
            progressMs: 2700000,
            state: "paused",
            videoDecision: "directplay",
            audioDecision: "directplay",
          },
        ],
        summary: { total: 1, transcodes: 0, directPlays: 1, totalBitrate: "20 Mbps" },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tracearr", expandOneStreamToTwoRows: false } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByTestId("BsPauseFill")).toBeInTheDocument();
  });

  it("uses 0% progress when duration is 0 in single-row view", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            mediaTitle: "Short Clip",
            mediaType: "movie",
            durationMs: 0,
            progressMs: 5000,
            state: "playing",
            videoDecision: "directplay",
            audioDecision: "directplay",
          },
        ],
        summary: { total: 1, transcodes: 0, directPlays: 1, totalBitrate: "1 Mbps" },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "tracearr", expandOneStreamToTwoRows: false } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    const bars = container.querySelectorAll('div[style*="width"]');
    expect(bars.length).toBeGreaterThan(0);
    expect(bars[0]).toHaveStyle({ width: "0%" });
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

  it("renders both summary and details when view option is set to both", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            mediaTitle: "Inception",
            mediaType: "movie",
            durationMs: 7200000,
            progressMs: 2700000,
            state: "playing",
            videoDecision: "directplay",
            audioDecision: "directplay",
          },
        ],
        summary: { total: 1, transcodes: 0, directPlays: 1, totalBitrate: "20 Mbps" },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tracearr", view: "both" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("tracearr.streams")).toBeInTheDocument();
    expect(screen.getByText("Inception")).toBeInTheDocument();
  });
});
