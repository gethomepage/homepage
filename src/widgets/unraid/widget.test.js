import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("unraid widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
    expect(widget.api).toBeUndefined();
  });
});
