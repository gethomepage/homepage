import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("arcane widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("counts containers with available updates in updates mapping", () => {
    const payload = JSON.stringify({
      data: [
        { id: "1", updateInfo: { hasUpdate: true } },
        { id: "2", updateInfo: { hasUpdate: false } },
        { id: "3", updateInfo: { hasUpdate: true } },
        { id: "4" },
      ],
    });

    expect(widget.mappings.updates.map(payload)).toEqual({ imagesWithUpdates: 2 });
  });

  it("returns 0 updates when container list is missing or not an array", () => {
    expect(widget.mappings.updates.map(JSON.stringify({}))).toEqual({ imagesWithUpdates: 0 });
    expect(widget.mappings.updates.map(JSON.stringify({ data: null }))).toEqual({ imagesWithUpdates: 0 });
  });
});
