import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("miniflux widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("sums read and unread counters", () => {
    const result = widget.mappings.counters.map(
      Buffer.from(JSON.stringify({ reads: { 1: 2, 2: 3 }, unreads: { 1: 4, 2: 1 } })),
    );

    expect(result).toEqual({ read: 5, unread: 5 });
  });
});
