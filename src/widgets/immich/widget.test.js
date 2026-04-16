import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("immich widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
    expect(widget.api).toContain("/api/");
    expect(widget.mappings?.version?.endpoint).toBe("server-info/version");
    expect(widget.mappings?.version_v2?.endpoint).toBe("server/version");
    expect(widget.mappings?.statistics_v2?.endpoint).toBe("server/statistics");
  });
});
