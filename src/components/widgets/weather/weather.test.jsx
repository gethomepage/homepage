// @vitest-environment jsdom

import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

import WeatherApi from "./weather";

describe("components/widgets/weather", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a location prompt when no coordinates are available", () => {
    renderWithProviders(<WeatherApi options={{}} />, { settings: { target: "_self" } });

    expect(screen.getByText("weather.current")).toBeInTheDocument();
    expect(screen.getByText("weather.allow")).toBeInTheDocument();
  });

  it("renders temperature and condition when coordinates are provided", async () => {
    useSWR.mockReturnValue({
      data: {
        current: {
          temp_c: 21.5,
          temp_f: 70.7,
          is_day: 1,
          condition: { code: 1000, text: "Sunny" },
        },
      },
      error: undefined,
    });

    renderWithProviders(
      <WeatherApi options={{ latitude: 1, longitude: 2, units: "metric", label: "Home", format: {} }} />,
      { settings: { target: "_self" } },
    );

    await waitFor(() => {
      expect(screen.getByText("Home, 21.5")).toBeInTheDocument();
    });
    expect(screen.getByText("Sunny")).toBeInTheDocument();
  });
});
