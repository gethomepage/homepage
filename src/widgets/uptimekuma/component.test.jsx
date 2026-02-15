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

describe("widgets/uptimekuma/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "uptimekuma" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("uptimekuma.up")).toBeInTheDocument();
    expect(screen.getByText("uptimekuma.down")).toBeInTheDocument();
    expect(screen.getByText("uptimekuma.uptime")).toBeInTheDocument();
    expect(screen.getByText("uptimekuma.incidents")).toBeInTheDocument();
  });

  it("computes site up/down and uptime percent when loaded (no incident)", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "status_page") return { data: { incident: null }, error: undefined };
      if (endpoint === "heartbeat") {
        return {
          data: {
            heartbeatList: {
              a: [{ status: 1 }],
              b: [{ status: 0 }],
            },
            uptimeList: { a: 0.5, b: 1 },
          },
          error: undefined,
        };
      }
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "uptimekuma" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "uptimekuma.up", 1);
    expectBlockValue(container, "uptimekuma.down", 1);
    // avg = (0.5 + 1) / 2 = 0.75 => "75.0"
    expectBlockValue(container, "uptimekuma.uptime", "75.0");
  });
});
