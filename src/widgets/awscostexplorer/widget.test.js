import { describe, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("widgets/awscostexplorer/widget", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });
});
