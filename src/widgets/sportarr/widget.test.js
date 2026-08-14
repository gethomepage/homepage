import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("sportarr widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps the queue response to a total count", () => {
    const result = widget.mappings.queue.map(Buffer.from(JSON.stringify([{ id: 1 }, { id: 2 }, { id: 3 }])));

    expect(result).toEqual({ total: 3 });
  });

  it("maps the leagues response to a total count", () => {
    const result = widget.mappings.leagues.map(Buffer.from(JSON.stringify([{ id: 1, name: "Formula 1" }])));

    expect(result).toEqual({ total: 1 });
  });

  it("validates totalRecords on the wanted endpoint", () => {
    expect(widget.mappings["wanted/missing"].validate).toEqual(["totalRecords"]);
  });
});
