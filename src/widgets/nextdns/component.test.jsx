// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/nextdns/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders waiting status while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "nextdns" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("widget.status")).toBeInTheDocument();
    expect(screen.getByText("nextdns.wait")).toBeInTheDocument();
  });

  it("renders no-devices status when data array is empty", () => {
    useWidgetAPI.mockReturnValue({ data: { data: [] }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "nextdns" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("nextdns.no_devices")).toBeInTheDocument();
  });

  it("renders a block per device status with query counts", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          { status: "nextdns.active", queries: 10 },
          { status: "nextdns.offline", queries: 2 },
        ],
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "nextdns" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("nextdns.active")).toBeInTheDocument();
    expect(screen.getByText("nextdns.offline")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
