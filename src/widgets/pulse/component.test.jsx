// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

  it("renders node, vm and lxc counts when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        resources: [
          { type: "node", status: "online" },
          { type: "node", status: "online" },
          { type: "node", status: "online" },
          { type: "vm", status: "running" },
          { type: "vm", status: "running" },
          { type: "vm", status: "stopped" },
          { type: "container", platformType: "proxmox-pve", status: "running" },
          { type: "container", platformType: "proxmox-pve", status: "stopped" },
        ],
      },
      error: undefined,
    });
    const { container } = renderWithProviders(<Component service={{ widget: { type: "pulse" } }} />, {
      settings: { hideErrors: false },
    });
    expectBlockValue(container, "pulse.nodes", "3/3");
    expectBlockValue(container, "pulse.vms", "2/3");
    expectBlockValue(container, "pulse.lxcs", "1/2");
  });

  it("renders error state", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "HTTP Error 401" } });
    const { container } = renderWithProviders(<Component service={{ widget: { type: "pulse" } }} />, {
      settings: { hideErrors: false },
    });
    expect(container.querySelector(".service-block")).toBeNull();
  });
});
