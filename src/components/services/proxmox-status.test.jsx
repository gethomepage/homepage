// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));

vi.mock("swr", () => ({
  default: useSWR,
}));

import ProxmoxStatus from "./proxmox-status";

describe("components/services/proxmox-status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests vm stats and renders running when status is running", () => {
    useSWR.mockReturnValue({ data: { status: "running" }, error: undefined });

    render(<ProxmoxStatus service={{ proxmoxNode: "n1", proxmoxVMID: "100" }} />);

    expect(useSWR).toHaveBeenCalledWith("/api/proxmox/stats/n1/100?type=qemu");
    expect(screen.getByText("docker.running")).toBeInTheDocument();
  });

  it("renders paused for paused vms", () => {
    useSWR.mockReturnValue({ data: { status: "paused" }, error: undefined });

    render(<ProxmoxStatus service={{ proxmoxNode: "n1", proxmoxVMID: "100", proxmoxType: "lxc" }} />);

    expect(useSWR).toHaveBeenCalledWith("/api/proxmox/stats/n1/100?type=lxc");
    expect(screen.getByText("paused")).toBeInTheDocument();
  });
});
