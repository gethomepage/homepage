// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/miniflux/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "miniflux" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("miniflux.unread")).toBeInTheDocument();
    expect(screen.getByText("miniflux.read")).toBeInTheDocument();
  });

  it("renders error UI when counters endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "miniflux" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders unread and read counters when loaded", () => {
    useWidgetAPI.mockReturnValue({ data: { unread: 3, read: 7 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "miniflux" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "miniflux.unread", 3);
    expectBlockValue(container, "miniflux.read", 7);
  });
});
