// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/ugreen/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading with default fields", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "ugreen" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["cpu", "mem", "uptime", "cpuTemp"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("ugreen.cpu")).toBeInTheDocument();
    expect(screen.getByText("ugreen.mem")).toBeInTheDocument();
    expect(screen.getByText("ugreen.uptime")).toBeInTheDocument();
    expect(screen.getByText("ugreen.cpuTemp")).toBeInTheDocument();
  });

  it("limits fields to MAX_ALLOWED_FIELDS", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = {
      widget: { type: "ugreen", fields: ["cpu", "mem", "uptime", "cpuTemp", "netRx"] },
    };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["cpu", "mem", "uptime", "cpuTemp"]);
  });

  it("renders stats and status data when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "stats") {
        return {
          data: {
            cpu: 25.5,
            mem: 60.2,
            cpuTemp: 45,
            netRx: 1024000,
            netTx: 512000,
            cpuFan: 1200,
            diskRead: 2048000,
            diskWrite: 1024000,
          },
          error: undefined,
        };
      }
      if (endpoint === "status") {
        return {
          data: { uptime: 86400, serverStatus: 2, devName: "UGreen Tempest" },
          error: undefined,
        };
      }
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "ugreen" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "ugreen.cpu", 25.5);
    expectBlockValue(container, "ugreen.mem", 60.2);
    expectBlockValue(container, "ugreen.uptime", 86400);
    expectBlockValue(container, "ugreen.cpuTemp", 45);
  });

  it("renders custom fields", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "stats") {
        return {
          data: { cpu: 10, mem: 20, cpuTemp: 40, netRx: 1000, netTx: 500, cpuFan: 1200, diskRead: 0, diskWrite: 0 },
          error: undefined,
        };
      }
      if (endpoint === "status") {
        return { data: { uptime: 3600 }, error: undefined };
      }
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "ugreen", fields: ["cpu", "netRx", "netTx", "fanSpeed"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
  });

  it("renders error state", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "stats") {
        return { data: undefined, error: { message: "Connection refused" } };
      }
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "ugreen" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("Connection refused")).toBeInTheDocument();
  });
});
