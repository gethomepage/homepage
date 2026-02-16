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
  Tooltip: ({ content }) => <div data-testid="Tooltip">{content}</div>,
}));

import Chart from "./chart";

describe("widgets/glances/components/chart", () => {
  it("renders a single-series chart scaffold", () => {
    render(<Chart dataPoints={[{ value: 1 }]} formatter={(v) => String(v)} label={["Series"]} />);

    expect(screen.getByTestId("ResponsiveContainer")).toBeInTheDocument();
    expect(screen.getByTestId("AreaChart")).toBeInTheDocument();
    const area = screen.getByTestId("Area");
    expect(area).toHaveAttribute("data-name", "Series");
    expect(area).toHaveAttribute("data-key", "value");
    expect(screen.getByTestId("Tooltip")).toBeInTheDocument();
  });
});
