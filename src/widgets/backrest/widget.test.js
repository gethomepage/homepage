import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("backrest widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
    expect(widget.api).toContain("/v1.Backrest/");
    expect(widget.mappings?.summary?.endpoint).toBe("GetSummaryDashboard");
  });
});
