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

  it("renders an error state when SWR errors", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    renderWithProviders(<Glances options={{ cpu: true, mem: true }} />, { settings: { target: "_self" } });

    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
  });

  it("renders placeholder resources while loading", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Glances options={{ cpu: true, mem: true, cputemp: true, disk: "/", uptime: true }} />, {
      settings: { target: "_self" },
    });

    // All placeholders use glances.wait.
    expect(screen.getAllByText("glances.wait").length).toBeGreaterThan(0);
  });

  it("renders placeholder disk resources when loading and disk is an array", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Glances options={{ disk: ["/", "/data"] }} />, { settings: { target: "_self" } });

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

  it("handles cpu sensor retrieval failures gracefully", () => {
    const sensor = {
      label: "cpu_thermal-0",
      type: "temperature_core",
      get value() {
        throw new Error("boom");
      },
      warning: 90,
    };

    useSWR.mockReturnValue({
      data: {
        cpu: { total: 1 },
        load: { min15: 1 },
        mem: { available: 1, total: 1, percent: 1 },
        fs: [],
        sensors: [sensor],
      },
      error: undefined,
    });

    renderWithProviders(<Glances options={{ cputemp: true }} />, { settings: { target: "_self" } });

    // When sensor processing fails, it should not render the temp block.
    expect(screen.queryByText("glances.temp")).toBeNull();
    expect(screen.getByText("glances.cpu")).toBeInTheDocument();
  });

  it("renders temperature in fahrenheit for matching cpu sensors and marks the widget expanded", () => {
    useSWR.mockReturnValue({
      data: {
        cpu: { total: 1 },
        load: { min15: 1 },
        mem: { available: 1, total: 1, percent: 1 },
        fs: [],
        sensors: [
          { label: "cpu_thermal-0", type: "temperature_core", value: 40, warning: 90 },
          { label: "Core 1", type: "temperature_core", value: 50, warning: 100 },
        ],
      },
      error: undefined,
    });

    renderWithProviders(
      <Glances options={{ cputemp: true, units: "imperial", expanded: true, url: "http://glances" }} />,
      {
        settings: { target: "_self" },
      },
    );

    // avg(40,50)=45C => 113F
    expect(screen.getByText("113")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveClass("expanded");
  });

  it("renders disk resources for an array of mount points and filters missing mounts", () => {
    useSWR.mockReturnValue({
      data: {
        cpu: { total: 1 },
        load: { min15: 1 },
        mem: { available: 1, total: 1, percent: 1 },
        fs: [{ mnt_point: "/", free: 10, size: 20, percent: 50 }],
        sensors: [],
      },
      error: undefined,
    });

    renderWithProviders(
      <Glances options={{ disk: ["/", "/missing"], diskUnits: "bbytes", expanded: true, url: "http://glances" }} />,
      {
        settings: { target: "_self" },
      },
    );

    // only one mount exists, but both free + total values should render for it
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("formats uptime into translated day/hour labels", () => {
    useSWR.mockReturnValue({
      data: {
        cpu: { total: 1 },
        load: { min15: 1 },
        mem: { available: 1, total: 1, percent: 1 },
        fs: [],
        sensors: [],
        uptime: "1 days, 00:00:00",
      },
      error: undefined,
    });

    renderWithProviders(<Glances options={{ uptime: true, url: "http://glances" }} />, {
      settings: { target: "_self" },
    });

    expect(screen.getByText("1glances.days 00glances.hours")).toBeInTheDocument();
  });
});
