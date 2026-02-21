import { expectWidgetConfigShape } from "test-utils/widget-config";
import { describe, it } from "vitest";
import widget from "./widget";

describe("sparkyfitness widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });
});
