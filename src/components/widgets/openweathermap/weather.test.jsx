// @vitest-environment jsdom

import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

import OpenWeatherMap from "./weather";

describe("components/widgets/openweathermap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a location prompt when no coordinates are available", () => {
    renderWithProviders(<OpenWeatherMap options={{}} />, { settings: { target: "_self" } });

    expect(screen.getByText("weather.current")).toBeInTheDocument();
    expect(screen.getByText("weather.allow")).toBeInTheDocument();
  });

  it("renders temperature and description when coordinates are provided", async () => {
    useSWR.mockReturnValue({
      data: {
        main: { temp: 71 },
        weather: [{ id: 800, description: "clear sky" }],
        dt: 10,
        sys: { sunrise: 0, sunset: 100 },
      },
      error: undefined,
    });

    renderWithProviders(<OpenWeatherMap options={{ latitude: 1, longitude: 2, label: "Home", format: {} }} />, {
      settings: { target: "_self" },
    });

    await waitFor(() => {
      expect(screen.getByText("Home, 71")).toBeInTheDocument();
    });
    expect(screen.getByText("clear sky")).toBeInTheDocument();
  });
});
