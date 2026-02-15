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

describe("widgets/scrutiny/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "scrutiny" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("scrutiny.passed")).toBeInTheDocument();
    expect(screen.getByText("scrutiny.failed")).toBeInTheDocument();
    expect(screen.getByText("scrutiny.unknown")).toBeInTheDocument();
  });

  it("counts passed/failed/unknown based on status_threshold", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "settings") {
        return { data: { settings: { metrics: { status_threshold: 2 } } }, error: undefined };
      }
      if (endpoint === "summary") {
        return {
          data: {
            data: {
              summary: {
                // passed=0, failed_smart=1, failed_scrutiny=2, unknown=99
                a: { device: { device_status: 0 } },
                b: { device: { device_status: 2 } },
                c: { device: { device_status: 99 } },
              },
            },
          },
          error: undefined,
        };
      }
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "scrutiny" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "scrutiny.passed", 1);
    expectBlockValue(container, "scrutiny.failed", 1);
    expectBlockValue(container, "scrutiny.unknown", 1);
  });
});
