// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./services_get_status";

describe("widgets/openmediavault/methods/services_get_status", () => {
  it("counts running/stopped/total services", () => {
    useWidgetAPI.mockReturnValue({
      data: { response: { data: [{ running: true }, { running: false }, { running: true }] } },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "openmediavault" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("openmediavault.running")).toBeInTheDocument();
    expect(screen.getByText("openmediavault.stopped")).toBeInTheDocument();
    expect(screen.getByText("openmediavault.total")).toBeInTheDocument();

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
