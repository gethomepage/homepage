// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

vi.mock("react-icons/bi", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    BiWifi: (props) => <svg data-testid="bi-wifi" {...props} />,
    BiNetworkChart: (props) => <svg data-testid="bi-network-chart" {...props} />,
    BiError: (props) => <svg data-testid="bi-error" {...props} />,
    BiCheckCircle: (props) => <svg data-testid="bi-check-circle" {...props} />,
    BiXCircle: (props) => <svg data-testid="bi-x-circle" {...props} />,
  };
});

import UnifiConsole from "./unifi_console";

describe("components/widgets/unifi_console", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an api error state when the widget api call fails", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: new Error("nope") });

    renderWithProviders(<UnifiConsole options={{ index: 0 }} />, { settings: { target: "_self" } });

    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
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

  it("selects a site by description when options.site is set", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            name: "default",
            desc: "Other",
            health: [
              { subsystem: "wan", status: "unknown" },
              { subsystem: "lan", status: "unknown" },
              { subsystem: "wlan", status: "unknown" },
            ],
          },
          {
            name: "site-2",
            desc: "My Site",
            health: [
              { subsystem: "wan", status: "ok", gw_name: "My GW", "gw_system-stats": { uptime: 86400 } },
              { subsystem: "lan", status: "unknown" },
              { subsystem: "wlan", status: "unknown" },
            ],
          },
        ],
      },
      error: undefined,
    });

    renderWithProviders(<UnifiConsole options={{ index: 0, site: "My Site" }} />, { settings: { target: "_self" } });

    expect(screen.getByText("My GW")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows wlan user/device counts when wlan is available and lan is unknown", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            name: "default",
            desc: "Home",
            health: [
              { subsystem: "wan", status: "unknown" },
              { subsystem: "lan", status: "unknown" },
              { subsystem: "wlan", status: "ok", num_user: 3, num_adopted: 10 },
            ],
          },
        ],
      },
      error: undefined,
    });

    renderWithProviders(<UnifiConsole options={{ index: 0 }} />, { settings: { target: "_self" } });

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("unifi.wlan")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByTitle("unifi.devices")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders an empty data hint when all subsystems are unknown and uptime is missing", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            name: "default",
            desc: "Home",
            health: [
              { subsystem: "wan", status: "unknown" },
              { subsystem: "lan", status: "unknown" },
              { subsystem: "wlan", status: "unknown" },
            ],
          },
        ],
      },
      error: undefined,
    });

    renderWithProviders(<UnifiConsole options={{ index: 0 }} />, { settings: { target: "_self" } });

    expect(screen.getByText("unifi.empty_data")).toBeInTheDocument();
  });

  it("shows wan state when wan is available but reports a non-ok status", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            name: "default",
            desc: "Home",
            health: [
              { subsystem: "wan", status: "error", gw_name: "Router" },
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
    expect(screen.getByText("unifi.wan")).toBeInTheDocument();
  });

  it("shows wlan down state when only wlan is available", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            name: "default",
            desc: "Home",
            health: [
              { subsystem: "wan", status: "unknown" },
              { subsystem: "lan", status: "unknown" },
              { subsystem: "wlan", status: "error", num_user: 1, num_adopted: 2 },
            ],
          },
        ],
      },
      error: undefined,
    });

    renderWithProviders(<UnifiConsole options={{ index: 0 }} />, { settings: { target: "_self" } });

    expect(screen.getByText("unifi.wlan")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows lan user/device counts when only lan is available", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            name: "default",
            desc: "Home",
            health: [
              { subsystem: "wan", status: "unknown" },
              { subsystem: "lan", status: "ok", num_user: 2, num_adopted: 5 },
              { subsystem: "wlan", status: "unknown" },
            ],
          },
        ],
      },
      error: undefined,
    });

    renderWithProviders(<UnifiConsole options={{ index: 0 }} />, { settings: { target: "_self" } });

    expect(screen.getByText("unifi.lan")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByTitle("unifi.devices")).toBeInTheDocument();
  });

  it("shows a lan down state when only lan is available and reports a non-ok status", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            name: "default",
            desc: "Home",
            health: [
              { subsystem: "wan", status: "unknown" },
              { subsystem: "lan", status: "error", num_user: 1, num_adopted: 2 },
              { subsystem: "wlan", status: "unknown" },
            ],
          },
        ],
      },
      error: undefined,
    });

    renderWithProviders(<UnifiConsole options={{ index: 0 }} />, { settings: { target: "_self" } });

    expect(screen.getByText("unifi.lan")).toBeInTheDocument();
    expect(screen.getByTestId("bi-x-circle")).toBeInTheDocument();
  });
});
