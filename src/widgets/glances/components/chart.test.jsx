// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="ResponsiveContainer">{children}</div>,
  AreaChart: ({ children }) => {
    // Filter out raw SVG elements (defs/linearGradient/stop) so jsdom doesn't warn.
    const kept = React.Children.toArray(children).filter((child) => typeof child?.type === "function");
    return <div data-testid="AreaChart">{kept}</div>;
  },
  Area: ({ name, dataKey }) => <div data-testid="Area" data-name={name} data-key={dataKey} />,
  YAxis: ({ domain, hide, allowDataOverflow }) => (
    <div
      data-testid="YAxis"
      data-domain={domain.join(",")}
      data-hide={hide}
      data-allow-data-overflow={allowDataOverflow}
    />
  ),
  Tooltip: ({ content }) => <div data-testid="Tooltip">{content}</div>,
}));

import Chart from "./chart";

describe("widgets/glances/components/chart", () => {
  it("renders an auto-scaled single-series chart by default", () => {
    render(<Chart dataPoints={[{ value: 1 }]} formatter={(v) => String(v)} label={["Series"]} />);

    expect(screen.getByTestId("ResponsiveContainer")).toBeInTheDocument();
    expect(screen.getByTestId("AreaChart")).toBeInTheDocument();
    const area = screen.getByTestId("Area");
    expect(area).toHaveAttribute("data-name", "Series");
    expect(area).toHaveAttribute("data-key", "value");
    expect(screen.queryByTestId("YAxis")).not.toBeInTheDocument();
    expect(screen.getByTestId("Tooltip")).toBeInTheDocument();
  });

  it("uses the configured maximum as the chart's full-height value", () => {
    render(<Chart dataPoints={[{ value: 1 }]} formatter={(v) => String(v)} label={["Series"]} chartMax={100} />);

    expect(screen.getByTestId("YAxis")).toHaveAttribute("data-domain", "0,100");
    expect(screen.getByTestId("YAxis")).toHaveAttribute("data-hide", "true");
    expect(screen.getByTestId("YAxis")).toHaveAttribute("data-allow-data-overflow", "true");
  });

  it("uses the configured minimum and maximum as the chart's value range", () => {
    render(
      <Chart
        dataPoints={[{ value: 1 }]}
        formatter={(v) => String(v)}
        label={["Series"]}
        chartMin={20}
        chartMax={100}
      />,
    );

    expect(screen.getByTestId("YAxis")).toHaveAttribute("data-domain", "20,100");
  });

  it("keeps the top auto-scaled when only chartMin is set", () => {
    render(<Chart dataPoints={[{ value: 1 }]} formatter={(v) => String(v)} label={["Series"]} chartMin={20} />);

    expect(screen.getByTestId("YAxis")).toHaveAttribute("data-domain", "20,auto");
  });

  it.each([0, -1, "100", Number.NaN, Number.POSITIVE_INFINITY])(
    "falls back to auto-scaling for invalid chartMax %s",
    (chartMax) => {
      render(<Chart dataPoints={[{ value: 1 }]} formatter={(v) => String(v)} label={["Series"]} chartMax={chartMax} />);

      expect(screen.queryByTestId("YAxis")).not.toBeInTheDocument();
    },
  );
});
