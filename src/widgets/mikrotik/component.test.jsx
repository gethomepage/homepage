// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/mikrotik/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "mikrotik" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("mikrotik.uptime")).toBeInTheDocument();
    expect(screen.getByText("mikrotik.cpuLoad")).toBeInTheDocument();
    expect(screen.getByText("mikrotik.memoryUsed")).toBeInTheDocument();
    expect(screen.getByText("mikrotik.numberOfLeases")).toBeInTheDocument();
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

  it("renders uptime, cpu load, memory used, and lease count", () => {
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
  });
});
