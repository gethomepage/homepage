// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component, { airtrailDefaultFields } from "./component";

const STATS_RESPONSE = {
  success: true,
  stats: {
    flights: 42,
    distanceKm: 12345.6,
    durationSeconds: 180000,
    airports: 18,
    topAirline: { id: 1, name: "Test Air", iata: "TA", icao: "TST", count: 10 },
    topAirport: { id: 2, name: "Home Airport", iata: "HME", icao: "KHME", count: 15 },
    topAircraft: { id: 3, name: "Airbus A320", icao: "A320", count: 8 },
    topRoute: {
      from: { id: 4, name: "Origin", iata: "ORG", icao: "KORG" },
      to: { id: 5, name: "Dest", iata: "DST", icao: "KDST" },
      count: 6,
    },
  },
};

describe("widgets/airtrail/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults to the four standard fields when none are configured", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "airtrail" } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(airtrailDefaultFields);
  });

  it("truncates fields to 4 and renders only the first four as loading placeholders", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = {
      widget: { type: "airtrail", fields: ["flights", "distance", "duration", "airports", "topAirline"] },
    };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toHaveLength(4);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
  });

  it("renders loading placeholders for default fields while data is loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "airtrail" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("airtrail.flights")).toBeInTheDocument();
    expect(screen.getByText("airtrail.distance")).toBeInTheDocument();
    expect(screen.getByText("airtrail.duration")).toBeInTheDocument();
    expect(screen.getByText("airtrail.airports")).toBeInTheDocument();
  });

  it("renders the default four stat blocks when data is loaded", () => {
    useWidgetAPI.mockReturnValue({ data: STATS_RESPONSE, error: undefined });

    const service = { widget: { type: "airtrail" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "airtrail.flights", 42);
    expectBlockValue(container, "airtrail.distance", 12346);
    expectBlockValue(container, "airtrail.airports", 18);
  });

  it("converts durationSeconds to hours", () => {
    useWidgetAPI.mockReturnValue({ data: STATS_RESPONSE, error: undefined });

    // 180000 seconds = 50 hours
    const service = { widget: { type: "airtrail", fields: ["duration"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "airtrail.duration", 50);
    expect(container.querySelector(".service-block").textContent).toContain("h");
  });

  it("renders optional fields when explicitly configured", () => {
    useWidgetAPI.mockReturnValue({ data: STATS_RESPONSE, error: undefined });

    const service = {
      widget: { type: "airtrail", fields: ["topAirline", "topAirport", "topAircraft", "topRoute"] },
    };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "airtrail.topAirline", "Test Air");
    expectBlockValue(container, "airtrail.topAirport", "HME");
    expectBlockValue(container, "airtrail.topAircraft", "Airbus A320");
    expectBlockValue(container, "airtrail.topRoute", "ORG → DST");
  });

  it("renders '-' for optional fields when the API returns null", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        success: true,
        stats: {
          ...STATS_RESPONSE.stats,
          topAirline: null,
          topAirport: null,
          topAircraft: null,
          topRoute: null,
        },
      },
      error: undefined,
    });

    const service = {
      widget: { type: "airtrail", fields: ["topAirline", "topAirport", "topAircraft", "topRoute"] },
    };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    const blocks = Array.from(container.querySelectorAll(".service-block"));
    expect(blocks).toHaveLength(4);
    blocks.forEach((block) => expect(block.textContent).toContain("-"));
  });

  it("falls back to icao when iata is absent on topAirport and topRoute", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        success: true,
        stats: {
          ...STATS_RESPONSE.stats,
          topAirport: { id: 2, name: "No IATA Airport", iata: null, icao: "KNME", count: 5 },
          topRoute: {
            from: { id: 4, name: "Origin", iata: null, icao: "KORG" },
            to: { id: 5, name: "Dest", iata: null, icao: "KDST" },
            count: 3,
          },
        },
      },
      error: undefined,
    });

    const service = {
      widget: { type: "airtrail", fields: ["topAirport", "topRoute"] },
    };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "airtrail.topAirport", "KNME");
    expectBlockValue(container, "airtrail.topRoute", "KORG → KDST");
  });

  it("renders an error container when the API returns an error", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "Unauthorized" } });

    const service = { widget: { type: "airtrail" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(0);
  });
});
