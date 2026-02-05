import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("adguard widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
    expect(widget.mappings?.stats?.endpoint).toBe("stats");
  });
});
