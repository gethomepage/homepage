// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

import Component from "./component";

describe("widgets/kubernetes/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "kubernetes", namespace: "ns", app: "app" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(useSWR.mock.calls[0][0]).toContain("/api/kubernetes/status/ns/app?");
    expect(useSWR.mock.calls[1][0]).toContain("/api/kubernetes/stats/ns/app?");

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("docker.cpu")).toBeInTheDocument();
    expect(screen.getByText("docker.mem")).toBeInTheDocument();
  });

  it("renders offline status when status endpoint reports non-running state", () => {
    useSWR.mockImplementation((key) => {
      if (String(key).includes("/status/")) return { data: { status: "stopped" }, error: undefined };
      if (String(key).includes("/stats/")) return { data: { stats: { cpu: 0.1, mem: 10 } }, error: undefined };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "kubernetes", namespace: "ns", app: "app" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("docker.offline")).toBeInTheDocument();
    expect(screen.getByText("widget.status")).toBeInTheDocument();
  });

  it("renders cpu percent when cpuLimit is present, otherwise raw cpu number", () => {
    useSWR.mockImplementation((key) => {
      if (String(key).includes("/status/")) return { data: { status: "running" }, error: undefined };
      if (String(key).includes("/stats/"))
        return {
          data: { stats: { cpuLimit: true, cpuUsage: 12.3, cpu: 0.0001, mem: 1024 } },
          error: undefined,
        };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "kubernetes", namespace: "ns", app: "app" } }} />, {
      settings: { hideErrors: false },
    });

    // With cpuLimit=true, cpuUsage is formatted via common.percent mock -> string value.
    expect(screen.getByText("12.3")).toBeInTheDocument();
    expect(screen.getByText("1024")).toBeInTheDocument();
  });
});
