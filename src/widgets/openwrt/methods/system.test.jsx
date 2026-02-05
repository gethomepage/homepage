// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./system";

describe("widgets/openwrt/methods/system", () => {
  it("returns null while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });
    const { container } = renderWithProviders(<Component service={{ widget: { type: "openwrt" } }} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders uptime and cpu load when loaded", () => {
    useWidgetAPI.mockReturnValue({ data: { uptime: 123, cpuLoad: "0.5" }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "openwrt" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("openwrt.uptime")).toBeInTheDocument();
    expect(screen.getByText("openwrt.cpuLoad")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("0.5")).toBeInTheDocument();
  });
});
