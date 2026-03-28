import { describe, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("unifi_drive widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });
});
