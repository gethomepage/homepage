import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("glances widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
    expect(widget.allowedEndpoints?.test("3/quicklook")).toBe(true);
    expect(widget.allowedEndpoints?.test("12/cpu")).toBe(true);
    expect(widget.allowedEndpoints?.test("unknown")).toBe(false);
    expect(widget.allowedEndpoints?.test("xxcpuyy")).toBe(false);
    expect(widget.allowedEndpoints?.test("3/cpu/extra")).toBe(false);
    expect(widget.allowedEndpoints?.test("membrane")).toBe(false);
  });
});
