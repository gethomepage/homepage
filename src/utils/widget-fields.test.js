import { describe, expect, it } from "vitest";

import withWidgetFields from "./widget-fields";

describe("utils/widget-fields", () => {
  it("applies defaults without modifying the service", () => {
    const service = { name: "Example", widget: { type: "example" } };

    const normalizedService = withWidgetFields(service, ["one", "two"]);

    expect(normalizedService).toEqual({
      name: "Example",
      widget: { type: "example", fields: ["one", "two"] },
    });
    expect(service).toEqual({ name: "Example", widget: { type: "example" } });
  });

  it("treats an explicitly empty fields list as unset", () => {
    const service = { widget: { type: "example", fields: [] } };

    const normalizedService = withWidgetFields(service, ["one", "two"]);

    expect(normalizedService.widget.fields).toEqual(["one", "two"]);
  });

  it("copies and limits configured fields", () => {
    const service = { widget: { type: "example", fields: ["one", "two", "three"] } };

    const normalizedService = withWidgetFields(service, ["default"], 2);

    expect(normalizedService.widget.fields).toEqual(["one", "two"]);
    expect(normalizedService.widget.fields).not.toBe(service.widget.fields);
    expect(service.widget.fields).toEqual(["one", "two", "three"]);
  });
});
