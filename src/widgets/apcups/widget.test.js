import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("apcups widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
    // apcups talks TCP directly, so it does not use an `{url}/...` API template.
    expect(widget.api).toBeUndefined();
  });
});
