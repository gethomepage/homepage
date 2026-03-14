// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/proxmox/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "proxmox" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("proxmox.vms")).toBeInTheDocument();
    expect(screen.getByText("proxmox.lxc")).toBeInTheDocument();
    expect(screen.getByText("resources.cpu")).toBeInTheDocument();
    expect(screen.getByText("resources.mem")).toBeInTheDocument();
  });

  it("renders VM/LXC totals and aggregated cpu/mem when nodes are present", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          { type: "qemu", template: 0, node: "n1", status: "running" },
          { type: "qemu", template: 0, node: "n1", status: "stopped" },
          { type: "lxc", template: 0, node: "n1", status: "running" },
          { type: "node", node: "n1", status: "online", maxmem: 100, mem: 50, maxcpu: 4, cpu: 0.25 },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "proxmox" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "proxmox.vms", "1 / 2");
    expectBlockValue(container, "proxmox.lxc", "1 / 1");
    // cpu% = (usedCpu / maxCpu)*100 = ((0.25*4)/4)*100 = 25
    expectBlockValue(container, "resources.cpu", 25);
    // mem% = (50/100)*100 = 50
    expectBlockValue(container, "resources.mem", 50);
  });
});
