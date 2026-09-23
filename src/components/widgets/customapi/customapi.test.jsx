// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

vi.mock("components/resolvedicon", () => ({
  default: ({ icon }) => <div data-testid="resolved-icon" data-icon={icon} />,
}));

import CustomApi from "./customapi";

const settings = { settings: { target: "_self" } };

describe("components/widgets/customapi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows GitHub repo stats once loaded, with the fallback icon and a label", () => {
    const options = {
      index: 6,
      label: "Homepage",
      refreshInterval: 300000,
      mappings: [
        { field: "stargazers_count", label: "Stars", format: "number" },
        { field: "open_issues_count", label: "Open", format: "number" },
        { field: "forks_count", label: "Forks", format: "number" },
      ],
    };

    useSWR.mockReturnValue({ data: undefined, error: undefined });
    const { container, rerender } = renderWithProviders(<CustomApi options={options} />, settings);

    expect(useSWR).toHaveBeenCalledWith("/api/widgets/customapi?index=6", { refreshInterval: 300000 });
    expect(screen.getAllByText("-")).toHaveLength(3);
    expect(screen.queryByTestId("resolved-icon")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();

    useSWR.mockReturnValue({
      data: { stargazers_count: 32809, open_issues_count: 1, forks_count: 2127, owner: { login: "gethomepage" } },
      error: undefined,
    });
    rerender(<CustomApi options={options} />);

    expect(screen.queryByText("-")).toBeNull();
    expect(screen.getByText("Stars").nextSibling).toHaveTextContent("32809");
    expect(screen.getByText("Open").nextSibling).toHaveTextContent("1");
    expect(screen.getByText("Forks").nextSibling).toHaveTextContent("2127");
    expect(screen.getByText("Homepage")).toHaveClass("information-widget-label");
  });

  it("shows a nested weather value with a configured icon and suffix", () => {
    useSWR.mockReturnValue({
      data: { current: { time: "2026-09-22T20:15", temperature_2m: 7.8, wind_speed_10m: 12.4 } },
      error: undefined,
    });

    renderWithProviders(
      <CustomApi
        options={{
          index: 7,
          icon: "mdi-thermometer",
          mappings: [{ field: "current.temperature_2m", label: "Temp", format: "float", suffix: "°C" }],
        }}
      />,
      settings,
    );

    expect(useSWR).toHaveBeenCalledWith("/api/widgets/customapi?index=7", { refreshInterval: 10000 });
    expect(screen.getByTestId("resolved-icon")).toHaveAttribute("data-icon", "mdi-thermometer");
    expect(screen.getByText("7.8 °C")).toBeInTheDocument();
  });

  it("shows a status API's error field as data when it is mapped", () => {
    useSWR.mockReturnValue({ data: { error: "E_NONE", pending: 3 }, error: undefined });

    renderWithProviders(
      <CustomApi
        options={{
          index: 0,
          mappings: [
            { field: "error", label: "Status", remap: [{ value: "E_NONE", to: "OK" }] },
            { field: "pending", label: "Queue", format: "number" },
          ],
        }}
      />,
      settings,
    );

    expect(screen.queryByText("widget.api_error")).toBeNull();
    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows the error state when the upstream API fails, clamping a too-fast refresh", () => {
    useSWR.mockReturnValue({
      data: { error: { message: "HTTP Error", url: "api.github.com (see logs for details)" } },
      error: undefined,
    });

    renderWithProviders(
      <CustomApi
        options={{ index: 6, refreshInterval: 500, mappings: [{ field: "stargazers_count", label: "Stars" }] }}
      />,
      settings,
    );

    expect(useSWR).toHaveBeenCalledWith("/api/widgets/customapi?index=6", { refreshInterval: 1000 });
    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
    expect(screen.queryByText("Stars")).toBeNull();
  });
});
