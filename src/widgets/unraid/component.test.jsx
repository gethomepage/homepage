// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/unraid/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults widget.fields and filters down to 4 visible blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "unraid" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // Component sets default fields
    expect(service.widget.fields).toEqual(["status", "cpu", "memoryPercent", "notifications"]);

    // Container filters the many placeholder Blocks down to the selected fields.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("unraid.status")).toBeInTheDocument();
    expect(screen.getByText("unraid.cpu")).toBeInTheDocument();
    expect(screen.getByText("unraid.notifications")).toBeInTheDocument();
    expect(screen.getByText("unraid.memoryUsed")).toBeInTheDocument();
    expect(screen.queryByText("unraid.memoryAvailable")).toBeNull();
  });

  it("renders values for the default fields", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        arrayState: "started",
        cpuPercent: 12,
        memoryAvailable: 100,
        memoryUsed: 50,
        memoryUsedPercent: 33,
        unreadNotifications: 7,
        arrayUsed: 1,
        arrayFree: 2,
        arrayUsedPercent: 3,
        caches: {},
      },
      error: undefined,
    });

    const service = { widget: { type: "unraid" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("unraid.started")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("33")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
