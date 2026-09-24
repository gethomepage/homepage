import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("gitea widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("splits issues and pull requests", () => {
    const result = widget.mappings.issues.map(
      Buffer.from(JSON.stringify([{ id: 1, pull_request: {} }, { id: 2 }, { id: 3 }])),
    );

    expect(result.pulls.map((i) => i.id)).toEqual([1]);
    expect(result.issues.map((i) => i.id)).toEqual([2, 3]);
  });
});
