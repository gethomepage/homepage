import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("proxmoxbackupserver widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("requires failed task query params for the tasks endpoint", () => {
    expect(widget.mappings["nodes/localhost/tasks"].params).toEqual(["errors", "limit", "since"]);
  });
});
