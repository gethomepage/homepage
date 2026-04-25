import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("archisteamfarm widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps bot and stats responses into widget values", () => {
    expect(widget.mappings.bots.map(Buffer.from(JSON.stringify({ Result: { alpha: {}, beta: {} } })))).toEqual({
      count: 2,
    });

    expect(
      widget.mappings.stats.map(
        Buffer.from(
          JSON.stringify({
            Result: {
              Version: "6.3.4.2",
              MemoryUsage: "24865",
              ProcessStartTime: "2026-04-25T15:19:32.210Z",
            },
          }),
        ),
      ),
    ).toEqual({
      version: "6.3.4.2",
      memoryKiB: 24865,
      processStartTime: "2026-04-25T15:19:32.210Z",
    });
  });

  it("handles missing ASF result fields", () => {
    expect(widget.mappings.bots.map(Buffer.from(JSON.stringify({ nope: true })))).toEqual({ count: 0 });

    expect(widget.mappings.stats.map(Buffer.from(JSON.stringify({ Result: {} })))).toEqual({
      version: undefined,
      memoryKiB: Number.NaN,
      processStartTime: undefined,
    });
  });
});
