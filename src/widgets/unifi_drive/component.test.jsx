// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/unifi_drive/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "unifi_drive" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("resources.total")).toBeInTheDocument();
    expect(screen.getByText("resources.used")).toBeInTheDocument();
    expect(screen.getByText("resources.free")).toBeInTheDocument();
    expect(screen.getByText("widget.status")).toBeInTheDocument();
  });

  it("renders error when API fails", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: new Error("fail") });

    const service = { widget: { type: "unifi_drive" } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText("widget.api_error", { exact: false }).length).toBeGreaterThan(0);
  });

  it("renders no_data when pools array is empty", () => {
    useWidgetAPI.mockReturnValue({ data: { pools: [] }, error: undefined });

    const service = { widget: { type: "unifi_drive" } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getByText("unifi_drive.no_data")).toBeInTheDocument();
  });

  it("renders no_data when pools is missing", () => {
    useWidgetAPI.mockReturnValue({ data: {}, error: undefined });

    const service = { widget: { type: "unifi_drive" } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getByText("unifi_drive.no_data")).toBeInTheDocument();
  });

  it("renders storage statistics from single pool", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        pools: [{ capacity: 1000000000000, usage: 350000000000, status: "fullyOperational" }],
      },
      error: undefined,
    });

    const service = { widget: { type: "unifi_drive" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "resources.total", 1000000000000);
    expectBlockValue(container, "resources.used", 350000000000);
    expectBlockValue(container, "resources.free", 650000000000);
    expectBlockValue(container, "widget.status", "unifi_drive.healthy");
  });

  it("aggregates storage across multiple pools", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        pools: [
          { capacity: 1000000000000, usage: 300000000000, status: "fullyOperational" },
          { capacity: 500000000000, usage: 100000000000, status: "noDataProtectionYet" },
        ],
      },
      error: undefined,
    });

    const service = { widget: { type: "unifi_drive" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "resources.total", 1500000000000);
    expectBlockValue(container, "resources.used", 400000000000);
    expectBlockValue(container, "resources.free", 1100000000000);
    expectBlockValue(container, "widget.status", "unifi_drive.healthy");
  });

  it("renders degraded status when any pool is degraded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        pools: [
          { capacity: 1000, usage: 400, status: "fullyOperational" },
          { capacity: 500, usage: 100, status: "degraded" },
        ],
      },
      error: undefined,
    });

    const service = { widget: { type: "unifi_drive" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "widget.status", "unifi_drive.degraded");
    expectBlockValue(container, "resources.free", 1000);
  });

  it("renders noDataProtectionYet as healthy", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        pools: [{ capacity: 1000, usage: 200, status: "noDataProtectionYet" }],
      },
      error: undefined,
    });

    const service = { widget: { type: "unifi_drive" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "widget.status", "unifi_drive.healthy");
  });

  it("handles pools with missing capacity or usage", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        pools: [{ status: "fullyOperational" }],
      },
      error: undefined,
    });

    const service = { widget: { type: "unifi_drive" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "resources.total", 0);
    expectBlockValue(container, "resources.used", 0);
    expectBlockValue(container, "resources.free", 0);
  });
});
