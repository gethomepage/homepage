// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/vibenvr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "vibenvr", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(5);
  });

  it("renders error UI when stats errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "vibenvr", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders error UI when events errors", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { active_cameras: 10 }, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: { message: "events fail" } });

    renderWithProviders(<Component service={{ widget: { type: "vibenvr", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("events fail")).toBeInTheDocument();
  });

  it("renders stats when data available", () => {
    useWidgetAPI
      .mockReturnValueOnce({
        data: { active_cameras: 10, storage: { used_gb: 4.34 }, uptime: "18h 34m" },
        error: undefined,
      })
      .mockReturnValueOnce({ data: [{ id: 1 }, { id: 2 }], error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "vibenvr", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(5);
  });

  it("handles missing storage and events", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { active_cameras: 0, uptime: "0m" }, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "vibenvr", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(5);
  });
});
