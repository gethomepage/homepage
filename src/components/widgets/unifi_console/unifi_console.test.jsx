// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import UnifiConsole from "./unifi_console";

describe("components/widgets/unifi_console", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a wait state when no site is available yet", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<UnifiConsole options={{ index: 0 }} />, { settings: { target: "_self" } });

    expect(screen.getByText("unifi.wait")).toBeInTheDocument();
  });

  it("renders site name and uptime when data is available", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            name: "default",
            desc: "Home",
            health: [
              {
                subsystem: "wan",
                status: "ok",
                gw_name: "Router",
                "gw_system-stats": { uptime: 172800 },
              },
              { subsystem: "lan", status: "unknown" },
              { subsystem: "wlan", status: "unknown" },
            ],
          },
        ],
      },
      error: undefined,
    });

    renderWithProviders(<UnifiConsole options={{ index: 0 }} />, { settings: { target: "_self" } });

    expect(screen.getByText("Router")).toBeInTheDocument();
    // common.number is mocked to return the numeric value as a string.
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("unifi.days")).toBeInTheDocument();
  });
});
