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

  it("renders status capitalization and origin_ip from nested connections", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        result: { status: "healthy", connections: { origin_ip: "1.2.3.4" } },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "cloudflared" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "cloudflared.status", "Healthy");
    expectBlockValue(container, "cloudflared.origin_ip", "1.2.3.4");
  });

  it("falls back to origin_ip from first connection entry", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        result: { status: "down", connections: [{ origin_ip: "5.6.7.8" }] },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "cloudflared" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "cloudflared.origin_ip", "5.6.7.8");
  });
});
