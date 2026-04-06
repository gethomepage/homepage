// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue, findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

vi.mock("widgets/tailscale/device", () => ({
  default: ({ name, online, isExitNode, hasSubnets, sshEnabled }) => (
    <div
      data-testid="tailscale-device"
      data-name={name}
      data-online={String(!!online)}
      data-exit-node={String(!!isExitNode)}
      data-subnets={String(!!hasSubnets)}
      data-ssh={String(!!sshEnabled)}
    />
  ),
}));

import Component from "./component";

const MOCK_DEVICES = [
  {
    id: "1",
    name: "server-a",
    addresses: ["100.64.0.1"],
    connectedToControl: true,
    advertisedRoutes: ["0.0.0.0/0", "::/0", "192.168.1.0/24"],
    enabledRoutes: ["192.168.1.0/24"],
    sshEnabled: true,
  },
  {
    id: "2",
    name: "laptop-b",
    addresses: ["100.64.0.2"],
    connectedToControl: false,
    advertisedRoutes: [],
    enabledRoutes: [],
    sshEnabled: false,
  },
  {
    id: "3",
    name: "phone-c",
    addresses: ["100.64.0.3"],
    connectedToControl: true,
    advertisedRoutes: [],
    enabledRoutes: [],
  },
];

describe("widgets/tailscale/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Backwards compat: single device mode (no tailnet set) ---

  it("uses device endpoint when no tailnet is configured", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tailscale" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenCalledWith(expect.objectContaining({ type: "tailscale" }), "device");
  });

  it("renders single-device placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("tailscale.address")).toBeInTheDocument();
    expect(screen.getByText("tailscale.last_seen")).toBeInTheDocument();
    expect(screen.getByText("tailscale.expires")).toBeInTheDocument();
  });

  it("renders single-device address and expiry when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        addresses: ["100.64.0.1"],
        keyExpiryDisabled: true,
        lastSeen: "2019-12-31T23:00:00Z",
        expires: "2021-01-01T00:00:00Z",
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "tailscale.address", "100.64.0.1");
    expect(findServiceBlockByLabel(container, "tailscale.last_seen")?.textContent).toContain("tailscale.ago");
    expectBlockValue(container, "tailscale.expires", "tailscale.never");
  });

  it("renders single-device expiry countdown when key expiry is enabled", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        addresses: ["100.64.0.1"],
        keyExpiryDisabled: false,
        lastSeen: "2019-12-31T23:59:50Z",
        expires: "2020-02-01T00:00:00Z",
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale" } }} />, {
      settings: { hideErrors: false },
    });

    // Should show a time duration, not "never"
    const expiresBlock = findServiceBlockByLabel(container, "tailscale.expires");
    expect(expiresBlock?.textContent).not.toContain("tailscale.never");
  });

  // --- Tailnet mode: summary view (default) ---

  it("uses devices endpoint when tailnet is configured", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tailscale", tailnet: "-" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenCalledWith(expect.objectContaining({ tailnet: "-" }), "devices");
  });

  it("renders summary placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale", tailnet: "-" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("tailscale.total_devices")).toBeInTheDocument();
    expect(screen.getByText("tailscale.online")).toBeInTheDocument();
    expect(screen.getByText("tailscale.offline")).toBeInTheDocument();
  });

  it("renders summary counts from connectedToControl field", () => {
    useWidgetAPI.mockReturnValue({ data: MOCK_DEVICES, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale", tailnet: "-" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "tailscale.total_devices", "3");
    expectBlockValue(container, "tailscale.online", "2");
    expectBlockValue(container, "tailscale.offline", "1");
    // Summary view should not render device rows
    expect(screen.queryByTestId("tailscale-device")).toBeNull();
  });

  // --- Tailnet mode: detail view (summaryView: false) ---

  it("renders device rows when summaryView is false", () => {
    useWidgetAPI.mockReturnValue({ data: MOCK_DEVICES, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tailscale", tailnet: "-", summaryView: false } }} />, {
      settings: { hideErrors: false },
    });

    const deviceRows = screen.getAllByTestId("tailscale-device");
    expect(deviceRows).toHaveLength(3);
  });

  it("sorts online devices before offline, then alphabetical", () => {
    useWidgetAPI.mockReturnValue({ data: MOCK_DEVICES, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tailscale", tailnet: "-", summaryView: false } }} />, {
      settings: { hideErrors: false },
    });

    const deviceRows = screen.getAllByTestId("tailscale-device");
    const names = deviceRows.map((d) => d.getAttribute("data-name"));
    // Online first (phone-c, server-a alphabetical), then offline (laptop-b)
    expect(names).toEqual(["phone-c", "server-a", "laptop-b"]);
  });

  it("derives exit node flag from advertisedRoutes", () => {
    useWidgetAPI.mockReturnValue({ data: MOCK_DEVICES, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tailscale", tailnet: "-", summaryView: false } }} />, {
      settings: { hideErrors: false },
    });

    const deviceRows = screen.getAllByTestId("tailscale-device");
    const exitNodes = deviceRows.filter((d) => d.getAttribute("data-exit-node") === "true");
    expect(exitNodes).toHaveLength(1);
    expect(exitNodes[0].getAttribute("data-name")).toBe("server-a");
  });

  it("derives subnet flag from enabledRoutes excluding exit node routes", () => {
    useWidgetAPI.mockReturnValue({ data: MOCK_DEVICES, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tailscale", tailnet: "-", summaryView: false } }} />, {
      settings: { hideErrors: false },
    });

    const deviceRows = screen.getAllByTestId("tailscale-device");
    const subnetRouters = deviceRows.filter((d) => d.getAttribute("data-subnets") === "true");
    expect(subnetRouters).toHaveLength(1);
    expect(subnetRouters[0].getAttribute("data-name")).toBe("server-a");
  });

  it("passes sshEnabled from API response", () => {
    useWidgetAPI.mockReturnValue({ data: MOCK_DEVICES, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tailscale", tailnet: "-", summaryView: false } }} />, {
      settings: { hideErrors: false },
    });

    const deviceRows = screen.getAllByTestId("tailscale-device");
    const sshDevices = deviceRows.filter((d) => d.getAttribute("data-ssh") === "true");
    expect(sshDevices).toHaveLength(1);
    expect(sshDevices[0].getAttribute("data-name")).toBe("server-a");
  });

  // --- Error handling ---

  it("renders error when API returns an error", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "Unauthorized" } });

    renderWithProviders(<Component service={{ widget: { type: "tailscale", tailnet: "-" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.queryByText("tailscale.total_devices")).not.toBeInTheDocument();
  });
});
