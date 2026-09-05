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
      .mockReturnValueOnce({ data: { statuses: { c: { status: "exited" } } }, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "docker", container: "c" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("widget.status")).toBeInTheDocument();
    expect(screen.getByText("docker.offline")).toBeInTheDocument();
  });

  it("surfaces a docker error payload instead of reporting the container offline", () => {
    useSWR
      .mockReturnValueOnce({ data: { error: { message: "socket unreachable" } }, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "docker", container: "c", server: "s" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.queryByText("docker.offline")).not.toBeInTheDocument();
  });

  it("treats a missing container in the bulk status map as offline", () => {
    useSWR
      .mockReturnValueOnce({ data: { statuses: {} }, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "docker", container: "c", server: "s" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useSWR).toHaveBeenCalledWith("/api/docker/statuses?server=s");
    expect(screen.getByText("docker.offline")).toBeInTheDocument();
  });

  it("renders cpu/mem/rx/tx values when stats are available", () => {
    useSWR
      .mockReturnValueOnce({ data: { statuses: { c: { status: "running" } } }, error: undefined })
      .mockReturnValueOnce({ data: { stats: { c: { cpu: 20, mem: 900, rx: 4, tx: 6 } } }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "docker", container: "c" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useSWR).toHaveBeenCalledWith("/api/docker/stats?server=");
    expect(container.textContent).toContain("20");
    expect(container.textContent).toContain("900");
    expect(container.textContent).toContain("4");
    expect(container.textContent).toContain("6");
  });

  it("omits the mem and network blocks when the api omits those fields", () => {
    useSWR
      .mockReturnValueOnce({ data: { statuses: { c: { status: "running" } } }, error: undefined })
      .mockReturnValueOnce({ data: { stats: { c: { cpu: 20 } } }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "docker", container: "c" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("docker.cpu")).toBeInTheDocument();
    expect(screen.queryByText("docker.mem")).not.toBeInTheDocument();
    expect(screen.queryByText("docker.rx")).not.toBeInTheDocument();
  });

  it("surfaces a per container stats error rather than reporting it missing", () => {
    useSWR
      .mockReturnValueOnce({ data: { statuses: { c: { status: "running" } } }, error: undefined })
      .mockReturnValueOnce({ data: { stats: { c: { error: "connect ETIMEDOUT" } } }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "docker", container: "c", server: "s" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget.api_error/).length).toBeGreaterThan(0);
    expect(screen.queryByText("docker.cpu")).not.toBeInTheDocument();
  });

  it("reports an error when a running container is absent from the stats map", () => {
    useSWR
      .mockReturnValueOnce({ data: { statuses: { c: { status: "running" } } }, error: undefined })
      .mockReturnValueOnce({ data: { stats: {} }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "docker", container: "c", server: "s" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget.api_error/).length).toBeGreaterThan(0);
    expect(screen.queryByText("docker.cpu")).not.toBeInTheDocument();
  });
});
