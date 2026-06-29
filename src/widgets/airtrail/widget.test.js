import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("airtrail widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps stats to the api/stats endpoint", () => {
    expect(widget.mappings.stats.endpoint).toBe("api/stats");
  });
});
