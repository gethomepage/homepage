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

describe("widgets/moonraker/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "moonraker" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(1);
    expect(screen.getByText("moonraker.printer_state")).toBeInTheDocument();
  });

  it("renders printer state as shutdown when webhook reports shutdown", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "print_stats") {
        return { data: { result: { status: { print_stats: { state: "standby", info: {} } } } }, error: undefined };
      }
      if (endpoint === "display_status") {
        return { data: { result: { status: { display_status: { progress: 0 } } } }, error: undefined };
      }
      if (endpoint === "webhooks") {
        return { data: { result: { status: { webhooks: { state: "shutdown" } } } }, error: undefined };
      }
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "moonraker" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(1);
    expectBlockValue(container, "moonraker.printer_state", "shutdown");
  });

  it("renders layers, progress and print status when active", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "print_stats") {
        return {
          data: {
            result: {
              status: {
                print_stats: { state: "printing", info: { current_layer: 1, total_layer: 2 } },
              },
            },
          },
          error: undefined,
        };
      }
      if (endpoint === "display_status") {
        return { data: { result: { status: { display_status: { progress: 0.25 } } } }, error: undefined };
      }
      if (endpoint === "webhooks") {
        return { data: { result: { status: { webhooks: { state: "ready" } } } }, error: undefined };
      }
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "moonraker" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expectBlockValue(container, "moonraker.layers", "1 / 2");
    expectBlockValue(container, "moonraker.print_progress", 25);
    expectBlockValue(container, "moonraker.print_status", "printing");
  });
});
