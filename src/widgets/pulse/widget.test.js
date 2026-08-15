import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("pulse widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps the Pulse v6 summary endpoint", () => {
    expect(widget.mappings.summary.endpoint).toBe("api/state/summary");
  });
});
