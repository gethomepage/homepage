// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));

vi.mock("swr", () => ({
  default: useSWR,
}));

import Component from "./component";

describe("widgets/docker/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders offline status when container is not running", () => {
    useSWR
      .mockReturnValueOnce({ data: { status: "exited" }, error: undefined }) // status
      .mockReturnValueOnce({ data: undefined, error: undefined }); // stats

    renderWithProviders(<Component service={{ widget: { type: "docker", container: "c" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("widget.status")).toBeInTheDocument();
    expect(screen.getByText("docker.offline")).toBeInTheDocument();
  });

  it("renders cpu/mem/rx/tx values when stats are available", () => {
    useSWR
      .mockReturnValueOnce({ data: { status: "running" }, error: undefined }) // status
      .mockReturnValueOnce({
        data: {
          stats: {
            cpu_stats: { cpu_usage: { total_usage: 200 }, system_cpu_usage: 2000, online_cpus: 2 },
            precpu_stats: { cpu_usage: { total_usage: 100 }, system_cpu_usage: 1000 },
            memory_stats: { usage: 1000, total_inactive_file: 100 },
            networks: { eth0: { rx_bytes: 1, tx_bytes: 2 }, eth1: { rx_bytes: 3, tx_bytes: 4 } },
          },
        },
        error: undefined,
      });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "docker", container: "c" } }} />, {
      settings: { hideErrors: false },
    });

    // cpu: (100/1000)*2*100=20
    expect(container.textContent).toContain("20");
    // mem used: 1000-100=900
    expect(container.textContent).toContain("900");
    // rx=4, tx=6
    expect(container.textContent).toContain("4");
    expect(container.textContent).toContain("6");
  });
});
