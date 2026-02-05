// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));

vi.mock("swr", () => ({
  default: useSWR,
}));

vi.mock("i18next", () => ({
  t: (key) => key,
}));

import KubernetesStatus from "./kubernetes-status";

describe("components/services/kubernetes-status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes podSelector in the request when provided", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    render(<KubernetesStatus service={{ namespace: "ns", app: "app", podSelector: "x=y" }} />);

    expect(useSWR).toHaveBeenCalledWith("/api/kubernetes/status/ns/app?podSelector=x=y");
  });

  it("renders the health/status label when running", () => {
    useSWR.mockReturnValue({ data: { status: "running", health: "healthy" }, error: undefined });

    render(<KubernetesStatus service={{ namespace: "ns", app: "app" }} />);

    expect(screen.getByText("healthy")).toBeInTheDocument();
  });

  it("renders a dot when style is dot", () => {
    useSWR.mockReturnValue({ data: { status: "running" }, error: undefined });

    const { container } = render(<KubernetesStatus service={{ namespace: "ns", app: "app" }} style="dot" />);

    expect(container.querySelector(".rounded-full")).toBeTruthy();
  });

  it("renders an error label when SWR returns an error", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    const { container } = render(<KubernetesStatus service={{ namespace: "ns", app: "app" }} />);

    expect(screen.getByText("docker.error")).toBeInTheDocument();
    expect(container.querySelector(".k8s-status")?.getAttribute("title")).toBe("docker.error");
  });

  it("renders orange status labels when the workload is down/partial/not found", () => {
    useSWR.mockReturnValue({ data: { status: "down" }, error: undefined });

    const { container } = render(<KubernetesStatus service={{ namespace: "ns", app: "app" }} />);

    expect(screen.getByText("down")).toBeInTheDocument();
    // Ensure the status is used as a tooltip/title too.
    expect(container.querySelector(".k8s-status")?.getAttribute("title")).toBe("down");
  });
});
