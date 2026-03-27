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

  it("renders no_data when storage data is missing", () => {
    useWidgetAPI.mockReturnValue({ data: { data: null }, error: undefined });

    const service = { widget: { type: "unifi_drive" } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getByText("unifi_drive.no_data")).toBeInTheDocument();
  });

  it("renders storage statistics when data is loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: {
          totalQuota: 1000000000000,
          usage: { system: 100000000000, myDrives: 200000000000, sharedDrives: 50000000000 },
          status: "healthy",
        },
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

  it("renders degraded status", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: {
          totalQuota: 100,
          usage: { system: 10, myDrives: 20, sharedDrives: 5 },
          status: "degraded",
        },
      },
      error: undefined,
    });

    const service = { widget: { type: "unifi_drive" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "widget.status", "unifi_drive.degraded");
    expectBlockValue(container, "resources.free", 65);
  });
});
