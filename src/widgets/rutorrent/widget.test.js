import { describe, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("rutorrent widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });
});
