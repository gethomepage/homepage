// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/pulse/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pulse" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("pulse.nodes")).toBeInTheDocument();
    expect(screen.getByText("pulse.vms")).toBeInTheDocument();
    expect(screen.getByText("pulse.lxcs")).toBeInTheDocument();
  });

  it("renders error UI when the resources endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "missing token" } });

    renderWithProviders(<Component service={{ widget: { type: "pulse" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("missing token")).toBeInTheDocument();
  });

  it("renders active and total resource counts", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        resources: [
          { type: "node", status: "online" },
          { type: "node", status: "offline" },
          { type: "vm", status: "running" },
          { type: "vm", status: "stopped" },
          { type: "container", status: "running" },
        ],
        stats: {
          byType: {
            node: 2,
            vm: 2,
            container: 1,
          },
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pulse" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "pulse.nodes", "1 / 2");
    expectBlockValue(container, "pulse.vms", "1 / 2");
    expectBlockValue(container, "pulse.lxcs", "1 / 1");
  });

  it("falls back to stats totals when resources are not returned", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        stats: {
          byType: {
            node: 2,
            vm: 4,
            container: 3,
          },
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pulse" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "pulse.nodes", 2);
    expectBlockValue(container, "pulse.vms", 4);
    expectBlockValue(container, "pulse.lxcs", 3);
  });

  it("shows 0 counts when resources is missing but count is 0", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        count: 0,
        stats: {
          byType: {
            node: 0,
            vm: 0,
            container: 0,
          },
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pulse" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "pulse.nodes", 0);
    expectBlockValue(container, "pulse.vms", 0);
    expectBlockValue(container, "pulse.lxcs", 0);
  });

  it("falls back to resources length when stats totals are not returned", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        resources: [
          { type: "node", status: "online" },
          { type: "node", status: "offline" },
          { type: "vm", status: "running" },
          { type: "vm", status: "stopped" },
          { type: "container", status: "running" },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pulse" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "pulse.nodes", 2);
    expectBlockValue(container, "pulse.vms", 2);
    expectBlockValue(container, "pulse.lxcs", 1);
  });
});
