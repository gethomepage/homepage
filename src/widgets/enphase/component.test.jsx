// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const service = { widget: { type: "enphase", url: "https://10.9.8.242" } };

describe("widgets/enphase/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 4 placeholder blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("enphase.produced_today")).toBeInTheDocument();
    expect(screen.getByText("enphase.consumed_today")).toBeInTheDocument();
    expect(screen.getByText("enphase.producing")).toBeInTheDocument();
    expect(screen.getByText("enphase.imported_today")).toBeInTheDocument();
  });

  it("renders error UI on API error", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "fail" } });

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders produced, consuming, current production and exported blocks when exporting", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        wNow: 2400,
        whToday: 14500,
        consumptionWhToday: 12000,
        exportedToday: 2500,
        importedToday: 0,
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "enphase.produced_today", "14.50 kWh");
    expectBlockValue(container, "enphase.consumed_today", "12.00 kWh");
    expectBlockValue(container, "enphase.producing", "2.40 kW");
    expectBlockValue(container, "enphase.exported_today", "2.50 kWh");
    expect(screen.queryByText("enphase.imported_today")).toBeNull();
  });

  it("renders imported block and hides exported block when importing", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        wNow: 500,
        whToday: 3000,
        consumptionWhToday: 8000,
        exportedToday: 0,
        importedToday: 5000,
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "enphase.imported_today", "5.00 kWh");
    expect(screen.queryByText("enphase.exported_today")).toBeNull();
  });

  it("omits consumed/exported/imported blocks when consumption meters are absent", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        wNow: 1200,
        whToday: 8000,
        consumptionWhToday: null,
        exportedToday: null,
        importedToday: null,
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expectBlockValue(container, "enphase.produced_today", "8.00 kWh");
    expectBlockValue(container, "enphase.producing", "1.20 kW");
    expect(screen.queryByText("enphase.consumed_today")).toBeNull();
    expect(screen.queryByText("enphase.exported_today")).toBeNull();
    expect(screen.queryByText("enphase.imported_today")).toBeNull();
  });

  it("formats sub-kW power in watts", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        wNow: 450,
        whToday: 800,
        consumptionWhToday: null,
        exportedToday: null,
        importedToday: null,
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "enphase.producing", "450 W");
    expectBlockValue(container, "enphase.produced_today", "800 Wh");
  });
});
