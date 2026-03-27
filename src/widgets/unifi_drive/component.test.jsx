// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

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
    expect(screen.getByText("unifi_drive.total")).toBeInTheDocument();
    expect(screen.getByText("unifi_drive.used")).toBeInTheDocument();
    expect(screen.getByText("unifi_drive.available")).toBeInTheDocument();
    expect(screen.getByText("unifi_drive.status")).toBeInTheDocument();
  });

  it("renders error when API fails", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: new Error("fail") });

    const service = { widget: { type: "unifi_drive" } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText("widget.api_error", { exact: false }).length).toBeGreaterThan(0);
  });

  it("renders no_data when storage data is missing", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "storage") {
        return { data: { data: null }, error: undefined };
      }
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "unifi_drive" } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getByText("unifi_drive.no_data")).toBeInTheDocument();
  });

  it("renders storage statistics when data is loaded", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "storage") {
        return {
          data: {
            data: {
              totalQuota: 1000000000000,
              usage: { system: 100000000000, myDrives: 200000000000, sharedDrives: 50000000000 },
              status: "healthy",
            },
          },
          error: undefined,
        };
      }
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "unifi_drive" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
  });

  it("renders degraded status", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "storage") {
        return {
          data: {
            data: {
              totalQuota: 1000000000000,
              usage: { system: 100000000000, myDrives: 200000000000, sharedDrives: 50000000000 },
              status: "degraded",
            },
          },
          error: undefined,
        };
      }
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "unifi_drive" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
  });

  it("handles zero totalQuota gracefully", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "storage") {
        return {
          data: {
            data: {
              totalQuota: 0,
              usage: { system: 0, myDrives: 0, sharedDrives: 0 },
              status: "healthy",
            },
          },
          error: undefined,
        };
      }
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "unifi_drive" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
  });
});
