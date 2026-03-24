// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/cloudflared/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "cloudflared" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("cloudflared.status")).toBeInTheDocument();
    expect(screen.getByText("cloudflared.origin_ip")).toBeInTheDocument();
  });

  it("renders status capitalization and origin_ip for single tunnel", () => {
    useWidgetAPI.mockReturnValue({
      data: { mode: "single", status: "healthy", origin_ip: "1.2.3.4" },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "cloudflared" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "cloudflared.status", "Healthy");
    expectBlockValue(container, "cloudflared.origin_ip", "1.2.3.4");
  });

  it("falls back to N/A when origin_ip is null", () => {
    useWidgetAPI.mockReturnValue({
      data: { mode: "single", status: "down", origin_ip: null },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "cloudflared" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "cloudflared.status", "Down");
    expectBlockValue(container, "cloudflared.origin_ip", "N/A");
  });

  it("renders aggregate tunnel counts", () => {
    useWidgetAPI.mockReturnValue({
      data: { mode: "aggregate", healthy: 3, unhealthy: 1, total: 4 },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "cloudflared" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "cloudflared.healthy", "3");
    expectBlockValue(container, "cloudflared.unhealthy", "1");
    expectBlockValue(container, "cloudflared.total", "4");
  });

  it("renders aggregate with zero unhealthy", () => {
    useWidgetAPI.mockReturnValue({
      data: { mode: "aggregate", healthy: 5, unhealthy: 0, total: 5 },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "cloudflared" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "cloudflared.healthy", "5");
    expectBlockValue(container, "cloudflared.unhealthy", "0");
    expectBlockValue(container, "cloudflared.total", "5");
  });
});
