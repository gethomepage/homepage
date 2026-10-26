// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="ResponsiveContainer">{children}</div>,
  AreaChart: ({ children, stackOffset }) => (
    <div data-testid="AreaChart" data-stackoffset={stackOffset ?? ""}>
      {
        // Filter out raw SVG elements (defs/linearGradient/stop) so jsdom doesn't warn.
        React.Children.toArray(children).filter((child) => typeof child?.type === "function")
      }
    </div>
  ),
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

import ChartDual from "./chart_dual";

describe("widgets/glances/components/chart_dual", () => {
  it("renders a dual-series chart scaffold", () => {
    render(
      <ChartDual dataPoints={[{ a: 1, b: 2 }]} formatter={(v) => String(v)} label={["A", "B"]} stackOffset="expand" />,
    );

    expect(screen.getByTestId("ResponsiveContainer")).toBeInTheDocument();
    const chart = screen.getByTestId("AreaChart");
    expect(chart).toHaveAttribute("data-stackoffset", "expand");

    const areas = screen.getAllByTestId("Area");
    expect(areas).toHaveLength(2);
    expect(areas[0]).toHaveAttribute("data-key", "a");
    expect(areas[1]).toHaveAttribute("data-key", "b");
    expect(screen.queryByTestId("YAxis")).not.toBeInTheDocument();
  });

  it("uses the configured maximum as the dual-series chart's full-height value", () => {
    render(
      <ChartDual
        dataPoints={[{ a: 1, b: 2 }]}
        formatter={(v) => String(v)}
        label={["RX", "TX"]}
        chartMax={100_000_000}
      />,
    );

    expect(screen.getByTestId("YAxis")).toHaveAttribute("data-domain", "0,100000000");
    expect(screen.getByTestId("YAxis")).toHaveAttribute("data-hide", "true");
    expect(screen.getByTestId("YAxis")).toHaveAttribute("data-allow-data-overflow", "true");
  });

  it.each([0, -1, "100", Number.NaN, Number.POSITIVE_INFINITY])(
    "falls back to auto-scaling for invalid chartMax %s",
    (chartMax) => {
      render(
        <ChartDual
          dataPoints={[{ a: 1, b: 2 }]}
          formatter={(v) => String(v)}
          label={["RX", "TX"]}
          chartMax={chartMax}
        />,
      );

      expect(screen.queryByTestId("YAxis")).not.toBeInTheDocument();
    },
  );
});
