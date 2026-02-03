import { describe, expect, it } from "vitest";

import { buildHighlightConfig, evaluateHighlight, getHighlightClass } from "./highlights";

describe("utils/highlights", () => {
  it("buildHighlightConfig merges levels and namespaces unqualified field keys", () => {
    const cfg = buildHighlightConfig(
      { levels: { warn: "global-warn" } },
      {
        levels: { warn: "widget-warn", custom: "widget-custom" },
        cpu: { numeric: { when: "gt", value: 80, level: "warn" } },
      },
      "resources",
    );

    expect(cfg).not.toBeNull();
    expect(cfg.levels.warn).toBe("widget-warn");
    expect(cfg.levels.custom).toBe("widget-custom");

    // Field keys get normalized + namespaced.
    expect(cfg.fields.cpu).toBeTruthy();
    expect(cfg.fields["resources.cpu"]).toBeTruthy();
  });

  it("evaluateHighlight returns matching numeric rule with valueOnly metadata", () => {
    const cfg = buildHighlightConfig(
      null,
      {
        // valueOnly should propagate through the result so Block can apply styling.
        cpu: { valueOnly: true, numeric: { when: "gte", value: 90, level: "danger" } },
      },
      "resources",
    );

    const hit = evaluateHighlight("resources.cpu", " 90 ", cfg);
    expect(hit).toMatchObject({ level: "danger", source: "numeric", valueOnly: true });
  });

  it("evaluateHighlight supports string rules (case-insensitive includes)", () => {
    const cfg = buildHighlightConfig(null, { status: { string: { when: "includes", value: "down", level: "warn" } } });

    const hit = evaluateHighlight("status", "Service DOWN", cfg);
    expect(hit).toMatchObject({ level: "warn", source: "string" });
  });

  it("getHighlightClass returns configured class for a level", () => {
    const cfg = buildHighlightConfig({ levels: { danger: "danger-class" } }, {}, "x");
    expect(getHighlightClass("danger", cfg)).toBe("danger-class");
  });
});
