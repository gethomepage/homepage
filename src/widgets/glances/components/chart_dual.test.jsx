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
  });
});
