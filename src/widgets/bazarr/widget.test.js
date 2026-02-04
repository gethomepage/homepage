import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("bazarr widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
    expect(widget.api).toContain("apikey={key}");

    const moviesMapping = widget.mappings?.movies;
    expect(moviesMapping?.endpoint).toBe("movies");
    expect(moviesMapping?.map?.('{"total":123}')).toEqual({ total: 123 });
  });
});
