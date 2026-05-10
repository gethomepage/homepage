import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("ntfy widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps an empty latest message response to the no messages state", () => {
    expect(widget.mappings.messages.map(Buffer.from(""))).toEqual({
      title: null,
      message: null,
      priority: 3,
      time: null,
      tags: [],
    });
  });

  it("parses latest message responses", () => {
    expect(widget.mappings.messages.map(Buffer.from('{"message":"hello"}'))).toEqual({ message: "hello" });
  });
});
