const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

// Returns the fixed Y-axis domain for the configured bounds, or null to keep auto-scaling.
// chartMax must be above chartMin (or above 0 when chartMin is not set); otherwise the bounds are ignored.
export default function getChartDomain(chartMin, chartMax) {
  const hasMin = isNumber(chartMin);
  const hasMax = isNumber(chartMax);

  if (hasMin && hasMax) return chartMin < chartMax ? [chartMin, chartMax] : null;
  if (hasMax) return chartMax > 0 ? [0, chartMax] : null;
  if (hasMin) return [chartMin, "auto"];
  return null;
}
