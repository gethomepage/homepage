// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));
vi.mock("next/dynamic", () => ({
  default:
    () =>
    ({ chartMax }) => <div data-testid="ChartDual" data-chart-max={chartMax ?? ""} />,
}));

import Component from "./net";

describe("widgets/glances/metrics/net", () => {
  it("renders a placeholder while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });
    renderWithProviders(
      <Component service={{ widget: { chart: false, version: 3, pointsLimit: 3, metric: "net:eth0" } }} />,
      { settings: { hideErrors: false } },
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("passes the configured chart maximum to the network chart", () => {
    useWidgetAPI.mockReturnValue({
      data: [{ key: "interface_name", interface_name: "eth0", rx: 1000, tx: 500, time_since_update: 1 }],
      error: undefined,
    });
    renderWithProviders(
      <Component
        service={{ widget: { chart: true, chartMax: 100_000_000, version: 3, pointsLimit: 3, metric: "net:eth0" } }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByTestId("ChartDual")).toHaveAttribute("data-chart-max", "100000000");
  });
});
