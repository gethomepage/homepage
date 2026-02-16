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

import OpenMeteo from "./openmeteo";

describe("components/widgets/openmeteo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders an error state when the widget api returns an error", async () => {
    useSWR.mockReturnValue({ data: { error: "nope" }, error: undefined });

    renderWithProviders(<OpenMeteo options={{ latitude: 1, longitude: 2 }} />, { settings: { target: "_self" } });

    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
  });

  it("renders a location prompt when no coordinates are available", () => {
    renderWithProviders(<OpenMeteo options={{}} />, { settings: { target: "_self" } });

    expect(screen.getByText("weather.current")).toBeInTheDocument();
    expect(screen.getByText("weather.allow")).toBeInTheDocument();
  });

  it("requests browser geolocation on click and then renders the updating state", async () => {
    const getCurrentPosition = vi.fn((success) => success({ coords: { latitude: 10, longitude: 20 } }));
    vi.stubGlobal("navigator", {
      permissions: { query: vi.fn().mockResolvedValue({ state: "prompt" }) },
      geolocation: { getCurrentPosition },
    });

    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<OpenMeteo options={{}} />, { settings: { target: "_self" } });

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

    renderWithProviders(<OpenMeteo options={{}} />, { settings: { target: "_self" } });

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("location-searching")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("location-disabled")).toBeInTheDocument();
    });
  });

  it("auto-requests geolocation when permissions are granted", async () => {
    const getCurrentPosition = vi.fn((success) => success({ coords: { latitude: 30, longitude: 40 } }));
    const query = vi.fn().mockResolvedValue({ state: "granted" });
    vi.stubGlobal("navigator", {
      permissions: { query },
      geolocation: { getCurrentPosition },
    });

    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<OpenMeteo options={{}} />, { settings: { target: "_self" } });

    await waitFor(() => {
      expect(query).toHaveBeenCalled();
      expect(getCurrentPosition).toHaveBeenCalled();
    });
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

  it("uses night conditions and fahrenheit units when configured", async () => {
    useSWR.mockReturnValue({
      data: {
        current_weather: { temperature: 72, weathercode: 1, time: "2020-01-01T23:00" },
        daily: { sunrise: ["2020-01-01T06:00"], sunset: ["2020-01-01T18:00"] },
      },
      error: undefined,
    });

    renderWithProviders(<OpenMeteo options={{ latitude: 1, longitude: 2, units: "imperial", format: {} }} />, {
      settings: { target: "_self" },
    });

    await waitFor(() => {
      expect(screen.getByText("72")).toBeInTheDocument();
    });
    expect(screen.getByText("wmo.1-night")).toBeInTheDocument();
  });
});
