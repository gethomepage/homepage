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

  it("renders unknown when data is not available yet", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    render(<ProxmoxStatus service={{ proxmoxNode: "n1", proxmoxVMID: "100" }} />);

    expect(screen.getByText("docker.unknown")).toBeInTheDocument();
  });

  it("renders error when SWR returns an error", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    render(<ProxmoxStatus service={{ proxmoxNode: "n1", proxmoxVMID: "100" }} />);

    expect(screen.getByText("docker.error")).toBeInTheDocument();
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

  it("renders other terminal statuses (stopped/offline/not found)", () => {
    useSWR.mockReturnValue({ data: { status: "stopped" }, error: undefined });
    render(<ProxmoxStatus service={{ proxmoxNode: "n1", proxmoxVMID: "100" }} />);
    expect(screen.getByText("docker.exited")).toBeInTheDocument();

    useSWR.mockReturnValue({ data: { status: "offline" }, error: undefined });
    render(<ProxmoxStatus service={{ proxmoxNode: "n1", proxmoxVMID: "100" }} />);
    expect(screen.getByText("offline")).toBeInTheDocument();

    useSWR.mockReturnValue({ data: { status: "not found" }, error: undefined });
    render(<ProxmoxStatus service={{ proxmoxNode: "n1", proxmoxVMID: "100" }} />);
    expect(screen.getByText("docker.not_found")).toBeInTheDocument();
  });

  it("renders a dot status when style=dot", () => {
    useSWR.mockReturnValue({ data: { status: "running" }, error: undefined });

    const { container } = render(<ProxmoxStatus service={{ proxmoxNode: "n1", proxmoxVMID: "100" }} style="dot" />);

    expect(container.querySelector(".rounded-full")).toBeTruthy();
    expect(screen.queryByText("docker.running")).not.toBeInTheDocument();
  });
});
