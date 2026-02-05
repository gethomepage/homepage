// @vitest-environment jsdom

import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

vi.mock("react-icons/md", () => ({
  MdLocationDisabled: (props) => <svg data-testid="location-disabled" {...props} />,
  MdLocationSearching: (props) => <svg data-testid="location-searching" {...props} />,
}));

import WeatherApi from "./weather";

describe("components/widgets/weather", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders an error state when SWR errors or the API payload indicates an error", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });
    renderWithProviders(<WeatherApi options={{ latitude: 1, longitude: 2 }} />, { settings: { target: "_self" } });
    expect(screen.getByText("widget.api_error")).toBeInTheDocument();

    useSWR.mockReturnValue({ data: { error: "nope" }, error: undefined });
    renderWithProviders(<WeatherApi options={{ latitude: 1, longitude: 2 }} />, { settings: { target: "_self" } });
    expect(screen.getAllByText("widget.api_error").length).toBeGreaterThan(0);
  });

  it("renders a location prompt when no coordinates are available", () => {
    renderWithProviders(<WeatherApi options={{}} />, { settings: { target: "_self" } });

    expect(screen.getByText("weather.current")).toBeInTheDocument();
    expect(screen.getByText("weather.allow")).toBeInTheDocument();
  });

  it("auto-requests geolocation when permissions are granted", async () => {
    const getCurrentPosition = vi.fn((success) => success({ coords: { latitude: 30, longitude: 40 } }));
    const query = vi.fn().mockResolvedValue({ state: "granted" });
    vi.stubGlobal("navigator", {
      permissions: { query },
      geolocation: { getCurrentPosition },
    });

    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<WeatherApi options={{}} />, { settings: { target: "_self" } });

    await waitFor(() => {
      expect(query).toHaveBeenCalled();
      expect(getCurrentPosition).toHaveBeenCalled();
    });
  });

  it("requests browser geolocation on click and then renders the updating state", async () => {
    const getCurrentPosition = vi.fn((success) => success({ coords: { latitude: 10, longitude: 20 } }));
    vi.stubGlobal("navigator", {
      permissions: { query: vi.fn().mockResolvedValue({ state: "prompt" }) },
      geolocation: { getCurrentPosition },
    });

    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<WeatherApi options={{}} />, { settings: { target: "_self" } });

    screen.getByRole("button").click();

    await waitFor(() => {
      expect(getCurrentPosition).toHaveBeenCalled();
    });
    expect(screen.getByText("weather.updating")).toBeInTheDocument();
  });

  it("clears the requesting state when the browser denies geolocation", async () => {
    const getCurrentPosition = vi.fn((_success, failure) => setTimeout(() => failure(), 10));
    vi.stubGlobal("navigator", {
      permissions: { query: vi.fn().mockResolvedValue({ state: "prompt" }) },
      geolocation: { getCurrentPosition },
    });

    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<WeatherApi options={{}} />, { settings: { target: "_self" } });

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("location-searching")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("location-disabled")).toBeInTheDocument();
    });
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

  it("uses fahrenheit and night conditions when configured", async () => {
    useSWR.mockReturnValue({
      data: {
        current: {
          temp_c: 21.5,
          temp_f: 70.7,
          is_day: 0,
          condition: { code: 1000, text: "Clear" },
        },
      },
      error: undefined,
    });

    renderWithProviders(<WeatherApi options={{ latitude: 1, longitude: 2, units: "imperial", format: {} }} />, {
      settings: { target: "_self" },
    });

    await waitFor(() => {
      expect(screen.getByText("70.7")).toBeInTheDocument();
    });
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });
});
