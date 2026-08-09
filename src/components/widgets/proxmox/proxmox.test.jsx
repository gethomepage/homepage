// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

import Proxmox from "./proxmox";

describe("components/widgets/proxmox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an error state when SWR errors", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    renderWithProviders(<Proxmox options={{}} />, { settings: { target: "_self" } });

    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
  });

  it("renders an error state when the API returns an error payload", () => {
    useSWR.mockReturnValue({ data: { error: "boom" }, error: undefined });

    renderWithProviders(<Proxmox options={{}} />, { settings: { target: "_self" } });

    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
  });

  it("falls back to the generic title when no node or label is configured", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Proxmox options={{}} />, { settings: { target: "_self" } });

    expect(screen.getByText("proxmox.title")).toBeInTheDocument();
    expect(screen.getByTitle("proxmox.vms")).toBeInTheDocument();
    expect(screen.getByTitle("proxmox.lxc")).toBeInTheDocument();
    expect(screen.getByTitle("resources.cpu")).toBeInTheDocument();
    expect(screen.getByTitle("resources.mem")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(4);
  });

  it("shows the configured node name in the header", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Proxmox options={{ node: "pve-1" }} />, { settings: { target: "_self" } });

    expect(screen.getByText("pve-1")).toBeInTheDocument();
  });

  it("prefers an explicit label over the node name", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Proxmox options={{ node: "pve-1", label: "My Cluster" }} />, {
      settings: { target: "_self" },
    });

    expect(screen.getByText("My Cluster")).toBeInTheDocument();
    expect(screen.queryByText("pve-1")).not.toBeInTheDocument();
  });

  it("renders vm/lxc totals and cpu/mem percentages when data is present", () => {
    useSWR.mockReturnValue({
      data: {
        vms: { running: 1, total: 2 },
        lxc: { running: 1, total: 1 },
        cpu: { percent: 25 },
        memory: { percent: 50 },
      },
      error: undefined,
    });

    renderWithProviders(<Proxmox options={{}} />, { settings: { target: "_self" } });

    expect(screen.getByTitle("proxmox.vms")).toHaveTextContent("1/2");
    expect(screen.getByTitle("proxmox.lxc")).toHaveTextContent("1/1");
    expect(screen.getByTitle("resources.cpu")).toHaveTextContent("25");
    expect(screen.getByTitle("resources.mem")).toHaveTextContent("50");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("hides individual stats when disabled via options", () => {
    useSWR.mockReturnValue({
      data: {
        vms: { running: 1, total: 2 },
        lxc: { running: 1, total: 1 },
        cpu: { percent: 25 },
        memory: { percent: 50 },
      },
      error: undefined,
    });

    renderWithProviders(<Proxmox options={{ vms: false, lxc: false }} />, { settings: { target: "_self" } });

    expect(screen.queryByTitle("proxmox.vms")).not.toBeInTheDocument();
    expect(screen.queryByTitle("proxmox.lxc")).not.toBeInTheDocument();
    expect(screen.getByTitle("resources.cpu")).toBeInTheDocument();
    expect(screen.getByTitle("resources.mem")).toBeInTheDocument();
  });
});
