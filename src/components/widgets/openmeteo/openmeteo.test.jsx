// @vitest-environment jsdom

import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

import OpenMeteo from "./openmeteo";

describe("components/widgets/openmeteo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a location prompt when no coordinates are available", () => {
    renderWithProviders(<OpenMeteo options={{}} />, { settings: { target: "_self" } });

    expect(screen.getByText("weather.current")).toBeInTheDocument();
    expect(screen.getByText("weather.allow")).toBeInTheDocument();
  });

  it("renders temperature and condition when coordinates are provided", async () => {
    useSWR.mockReturnValue({
      data: {
        current_weather: { temperature: 22.2, weathercode: 0, time: "2020-01-01T12:00" },
        daily: { sunrise: ["2020-01-01T06:00"], sunset: ["2020-01-01T18:00"] },
      },
      error: undefined,
    });

    renderWithProviders(<OpenMeteo options={{ latitude: 1, longitude: 2, label: "Home", format: {} }} />, {
      settings: { target: "_self" },
    });

    await waitFor(() => {
      expect(screen.getByText("Home, 22.2")).toBeInTheDocument();
    });
    expect(screen.getByText("wmo.0-day")).toBeInTheDocument();
  });
});
