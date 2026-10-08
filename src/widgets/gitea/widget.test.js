import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget, { totalCount } from "./widget";

describe("gitea widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("reads the total count from the X-Total-Count header", () => {
    expect(totalCount(Buffer.from("[]"), { "x-total-count": "1234" })).toEqual({ count: 1234 });
    expect(totalCount(Buffer.from("[]"), { "x-total-count": "0" })).toEqual({ count: 0 });
  });

  it("returns a null count when the header is missing", () => {
    expect(totalCount(Buffer.from("[{}]"), {})).toEqual({ count: null });
    expect(totalCount(Buffer.from("[{}]"), undefined)).toEqual({ count: null });
  });
});
