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

describe("widgets/octoprint/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders minimal placeholder while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "octoprint" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(1);
    expect(screen.getByText("octoprint.printer_state")).toBeInTheDocument();
  });

  it("renders state from job_stats when printer_stats errors but job_stats is available", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "printer_stats") return { data: undefined, error: { message: "printer nope" } };
      if (endpoint === "job_stats") return { data: { state: "Paused" }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "octoprint" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "octoprint.printer_state", "Paused");
    expect(screen.queryByText("printer nope")).toBeNull();
  });

  it("renders job completion block when printing and completion is present", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "printer_stats") {
        return {
          data: {
            state: { text: "Printing" },
            temperature: { tool0: { actual: 200 }, bed: { actual: 60 } },
          },
          error: undefined,
        };
      }
      if (endpoint === "job_stats") return { data: { progress: { completion: 12.3456 } }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "octoprint" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "octoprint.printer_state", "Printing");
    expectBlockValue(container, "octoprint.temp_tool", "200");
    expectBlockValue(container, "octoprint.temp_bed", "60");
    expectBlockValue(container, "octoprint.job_completion", "12.35%");
  });
});
