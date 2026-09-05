// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));

vi.mock("swr", () => ({
  default: useSWR,
}));

import Status from "./status";

describe("components/services/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests docker status and renders unknown by default", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    render(<Status service={{ container: "c", server: "s" }} />);

    expect(useSWR).toHaveBeenCalledWith("/api/docker/statuses?server=s");
    expect(screen.getByText("docker.unknown")).toBeInTheDocument();

    render(<Status service={{ container: "c" }} />);
    expect(useSWR).toHaveBeenCalledWith("/api/docker/statuses?server=");
  });

  it("renders error when SWR fails", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    render(<Status service={{ container: "c", server: "s" }} />);

    expect(screen.getByText("docker.error")).toBeInTheDocument();
  });

  it("renders error when the api returns an error payload with a 200-parsed body", () => {
    useSWR.mockReturnValue({ data: { error: "query failed" }, error: undefined });

    render(<Status service={{ container: "c", server: "s" }} />);

    expect(screen.getByText("docker.error")).toBeInTheDocument();
    expect(screen.queryByText("docker.not_found")).not.toBeInTheDocument();
  });

  it("renders healthy/unhealthy and partial/exited/not found statuses", () => {
    useSWR.mockReturnValue({ data: { statuses: { c: { status: "running", health: "healthy" } } }, error: undefined });
    render(<Status service={{ container: "c", server: "s" }} />);
    expect(screen.getByText("docker.healthy")).toBeInTheDocument();

    useSWR.mockReturnValue({ data: { statuses: { c: { status: "running", health: "unhealthy" } } }, error: undefined });
    render(<Status service={{ container: "c", server: "s" }} />);
    expect(screen.getByText("docker.unhealthy")).toBeInTheDocument();

    useSWR.mockReturnValue({ data: { statuses: { c: { status: "partial 1/2" } } }, error: undefined });
    render(<Status service={{ container: "c", server: "s" }} />);
    expect(screen.getByText("docker.partial 1/2")).toBeInTheDocument();

    useSWR.mockReturnValue({ data: { statuses: { c: { status: "exited" } } }, error: undefined });
    render(<Status service={{ container: "c", server: "s" }} />);
    expect(screen.getByText("docker.exited")).toBeInTheDocument();

    useSWR.mockReturnValue({ data: { statuses: {} }, error: undefined });
    render(<Status service={{ container: "c", server: "s" }} />);
    expect(screen.getByText("docker.not_found")).toBeInTheDocument();
  });

  it("renders starting health when container is running and starting", () => {
    useSWR.mockReturnValue({ data: { statuses: { c: { status: "running", health: "starting" } } }, error: undefined });

    render(<Status service={{ container: "c", server: "s" }} />);

    expect(screen.getByText("docker.starting")).toBeInTheDocument();
  });

  it("renders the remaining container states instead of falling through to unknown", () => {
    const states = {
      created: "docker.created",
      paused: "docker.paused",
      restarting: "docker.restarting",
      removing: "docker.removing",
      dead: "docker.dead",
    };

    Object.entries(states).forEach(([status, label]) => {
      useSWR.mockReturnValue({ data: { statuses: { c: { status } } }, error: undefined });
      render(<Status service={{ container: "c", server: "s" }} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    expect(screen.queryByText("docker.unknown")).not.toBeInTheDocument();
  });

  it("colors problem states as warnings and merely stopped states neutrally", () => {
    useSWR.mockReturnValue({ data: { statuses: { c: { status: "restarting" } } }, error: undefined });
    const { container: restarting } = render(<Status service={{ container: "c", server: "s" }} style="dot" />);
    expect(restarting.querySelector(".bg-orange-400")).toBeInTheDocument();

    useSWR.mockReturnValue({ data: { statuses: { c: { status: "paused" } } }, error: undefined });
    const { container: paused } = render(<Status service={{ container: "c", server: "s" }} style="dot" />);
    expect(paused.querySelector(".bg-orange-400")).not.toBeInTheDocument();
  });

  it("does not surface health for containers that are not running", () => {
    useSWR.mockReturnValue({
      data: { statuses: { c: { status: "paused", health: "unhealthy" } } },
      error: undefined,
    });

    render(<Status service={{ container: "c", server: "s" }} />);

    expect(screen.getByText("docker.paused")).toBeInTheDocument();
    expect(screen.queryByText("docker.unhealthy")).not.toBeInTheDocument();
  });

  it("renders a dot when style is dot", () => {
    useSWR.mockReturnValue({ data: { statuses: { c: { status: "running" } } }, error: undefined });

    const { container } = render(<Status service={{ container: "c", server: "s" }} style="dot" />);

    expect(screen.queryByText("docker.running")).not.toBeInTheDocument();
    expect(container.querySelector(".rounded-full")).toBeTruthy();
  });
});
