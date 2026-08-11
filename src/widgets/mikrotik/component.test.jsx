// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/mikrotik/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "mikrotik" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(6);
    expect(screen.getByText("mikrotik.uptime")).toBeInTheDocument();
    expect(screen.getByText("mikrotik.cpuLoad")).toBeInTheDocument();
    expect(screen.getByText("mikrotik.memoryUsed")).toBeInTheDocument();
    expect(screen.getByText("mikrotik.numberOfLeases")).toBeInTheDocument();
    expect(screen.getByText("mikrotik.cpuTemperature")).toBeInTheDocument();
    expect(screen.getByText("mikrotik.sfpTemperature")).toBeInTheDocument();
  });

  it("renders error UI when either endpoint errors", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "leases") return { data: undefined, error: { message: "nope" } };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "mikrotik" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders uptime, cpu load, memory used, lease count, and temperatures", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "system") {
        return {
          data: {
            uptime: "1d",
            "cpu-load": 10,
            "free-memory": 25,
            "total-memory": 100,
          },
          error: undefined,
        };
      }

      if (endpoint === "leases") {
        return { data: [{ id: 1 }, { id: 2 }, { id: 3 }], error: undefined };
      }

      if (endpoint === "health") {
        return { data: { "cpu-temperature": 45 }, error: undefined };
      }

      if (endpoint === "sfp") {
        return { data: [{ "sfp-temperature": 30 }], error: undefined };
      }

      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "mikrotik" } }} />, {
      settings: { hideErrors: false },
    });

    // memoryUsed = 100 - (25/100)*100 = 75
    expectBlockValue(container, "mikrotik.uptime", "1d");
    expectBlockValue(container, "mikrotik.cpuLoad", 10);
    expectBlockValue(container, "mikrotik.memoryUsed", 75);
    expectBlockValue(container, "mikrotik.numberOfLeases", 3);
    expectBlockValue(container, "mikrotik.cpuTemperature", 45);
    expectBlockValue(container, "mikrotik.sfpTemperature", 30);
  });
});
