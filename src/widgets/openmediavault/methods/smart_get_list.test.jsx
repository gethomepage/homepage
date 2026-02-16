// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./smart_get_list";

describe("widgets/openmediavault/methods/smart_get_list", () => {
  it("counts passed/failed monitored disks", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        response: {
          output: JSON.stringify({
            data: [
              { monitor: true, overallstatus: "GOOD" },
              { monitor: true, overallstatus: "BAD" },
              { monitor: false, overallstatus: "BAD" },
            ],
          }),
        },
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "openmediavault" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("openmediavault.passed")).toBeInTheDocument();
    expect(screen.getByText("openmediavault.failed")).toBeInTheDocument();
    expect(screen.getAllByText("1")).toHaveLength(2);
  });
});
