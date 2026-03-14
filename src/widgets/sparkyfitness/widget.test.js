import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("sparkyfitness widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);

    const statsMapping = widget.mappings?.stats;
    expect(statsMapping?.endpoint).toBe("api/dashboard/stats");
    expect(statsMapping?.validate).toEqual(["eaten", "burned", "remaining", "steps"]);
  });
});
