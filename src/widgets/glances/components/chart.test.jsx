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
  YAxis: ({ domain, hide }) => <div data-testid="YAxis" data-domain={domain.join(",")} data-hide={hide} />,
  Tooltip: ({ content }) => <div data-testid="Tooltip">{content}</div>,
}));

import Chart, { yAxisRange } from "./chart";

describe("widgets/glances/components/chart", () => {
  it("renders a single-series chart scaffold", () => {
    render(<Chart dataPoints={[{ value: 1 }]} formatter={(v) => String(v)} label={["Series"]} />);

    expect(screen.getByTestId("ResponsiveContainer")).toBeInTheDocument();
    expect(screen.getByTestId("AreaChart")).toBeInTheDocument();
    const area = screen.getByTestId("Area");
    expect(area).toHaveAttribute("data-name", "Series");
    expect(area).toHaveAttribute("data-key", "value");
    expect(screen.queryByTestId("YAxis")).not.toBeInTheDocument();
    expect(screen.getByTestId("Tooltip")).toBeInTheDocument();
  });

  it("applies a fixed range on a hidden Y axis", () => {
    render(<Chart dataPoints={[{ value: 1 }]} formatter={(v) => String(v)} label={["Series"]} chartMax={100} />);

    const axis = screen.getByTestId("YAxis");
    expect(axis).toHaveAttribute("data-domain", "0,100");
    expect(axis).toHaveAttribute("data-hide", "true");
  });

  describe("yAxisRange", () => {
    it("auto-scales when neither bound is set", () => {
      expect(yAxisRange()).toBeUndefined();
    });

    it("uses both bounds when set", () => {
      expect(yAxisRange(20, 100)).toEqual([20, 100]);
    });

    it("starts at 0 when only chartMax is set", () => {
      expect(yAxisRange(undefined, 100)).toEqual([0, 100]);
    });

    it("auto-scales the top when only chartMin is set", () => {
      expect(yAxisRange(-10)).toEqual([-10, "auto"]);
    });

    it("accepts numeric strings", () => {
      expect(yAxisRange("0", " 1e8 ")).toEqual([0, 100000000]);
    });

    it("allows a range entirely below zero", () => {
      expect(yAxisRange(-30, -5)).toEqual([-30, -5]);
    });

    it.each([null, "", " ", "abc", true, Number.NaN, Number.POSITIVE_INFINITY, {}])(
      "ignores chartMax %s",
      (chartMax) => {
        expect(yAxisRange(undefined, chartMax)).toBeUndefined();
      },
    );

    it("ignores the bounds when chartMin is not below chartMax", () => {
      expect(yAxisRange(100, 100)).toBeUndefined();
      expect(yAxisRange(100, 50)).toBeUndefined();
    });
  });
});
