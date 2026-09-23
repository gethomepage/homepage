import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("unmanic widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("counts total and active workers", () => {
    const result = widget.mappings.workers.map(
      Buffer.from(JSON.stringify({ workers_status: [{ idle: true }, { idle: false }, { idle: false }] })),
    );

    expect(result).toEqual({ total_workers: 3, active_workers: 2 });
  });
});
