import { describe, expect, it } from "vitest";

import getChartDomain from "./chart_domain";

describe("widgets/glances/components/chart_domain", () => {
  it("returns null when no bounds are configured", () => {
    expect(getChartDomain(undefined, undefined)).toBeNull();
  });

  it("uses 0 as the minimum when only chartMax is set", () => {
    expect(getChartDomain(undefined, 100)).toEqual([0, 100]);
  });

  it("auto-scales the top when only chartMin is set", () => {
    expect(getChartDomain(20, undefined)).toEqual([20, "auto"]);
    expect(getChartDomain(-10, undefined)).toEqual([-10, "auto"]);
  });

  it("uses both bounds when valid", () => {
    expect(getChartDomain(20, 100)).toEqual([20, 100]);
  });

  it.each([
    [undefined, 0],
    [undefined, -1],
    [undefined, "100"],
    [undefined, Number.NaN],
    ["20", undefined],
    [Number.POSITIVE_INFINITY, undefined],
    [100, 100],
    [100, 50],
  ])("ignores invalid bounds chartMin=%s chartMax=%s", (chartMin, chartMax) => {
    expect(getChartDomain(chartMin, chartMax)).toBeNull();
  });
});
