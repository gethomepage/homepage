// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/bbox/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "bbox", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(5);
    expect(screen.getByText("widget.status")).toBeInTheDocument();
    expect(screen.getByText("bbox.modelname")).toBeInTheDocument();
    expect(screen.getByText("bbox.uptime")).toBeInTheDocument();
    expect(screen.getByText("bbbox.wanIPAddress")).toBeInTheDocument();
    expect(screen.getByText("bbox.devices")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "bbox", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders values correctly when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        status: "Up",
        modelname: "Bbox Fiber",
        uptime: 3600,
        wanIPAddress: "192.168.1.1",
        devices: [
          { id: 1, active: 1 },
          { id: 2, active: 0 },
          { id: 3, active: 1 },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "bbox", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "widget.status", "bbox.Up");
    expectBlockValue(container, "bbox.modelname", "Bbox Fiber");
    expectBlockValue(container, "bbox.uptime", "3600");
    expectBlockValue(container, "bbox.wanIPAddress", "192.168.1.1");
    expectBlockValue(container, "bbox.devices", "2 / 3");
  });
});
