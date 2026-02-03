// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

import Glances from "./glances";

describe("components/widgets/glances", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholder resources while loading", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Glances options={{ cpu: true, mem: true, cputemp: true, disk: "/", uptime: true }} />, {
      settings: { target: "_self" },
    });

    // All placeholders use glances.wait.
    expect(screen.getAllByText("glances.wait").length).toBeGreaterThan(0);
  });

  it("renders cpu percent and memory available when data is present", () => {
    useSWR.mockReturnValue({
      data: {
        cpu: { total: 12.34 },
        load: { min15: 5 },
        mem: { available: 1024, total: 2048, percent: 50 },
        fs: [{ mnt_point: "/", free: 100, size: 200, percent: 50 }],
        sensors: [],
        uptime: "1 days, 00:00:00",
      },
      error: undefined,
    });

    renderWithProviders(<Glances options={{ cpu: true, mem: true, disk: "/", uptime: true }} />, {
      settings: { target: "_self" },
    });

    // common.number is mocked to return the numeric value as a string.
    expect(screen.getByText("12.34")).toBeInTheDocument();
    // common.bytes is mocked similarly; we just assert the numeric value is present.
    expect(screen.getByText("1024")).toBeInTheDocument();
  });
});
