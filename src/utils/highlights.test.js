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

  it("supports localized numeric parsing and between/outside operators (with negate)", () => {
    const cfg = buildHighlightConfig(null, {
      temp: {
        numeric: [
          { when: "between", min: 1000.5, max: 1500.5, level: "warn" },
          { when: "outside", value: { min: 1234.5, max: 2234.5 }, level: "danger", negate: true },
        ],
      },
    });

    // "1.234,56" should parse as 1234.56 and hit the between rule.
    expect(evaluateHighlight("temp", "1.234,56", cfg)).toMatchObject({ level: "warn", source: "numeric" });

    // Negated outside => inside the range should match.
    expect(evaluateHighlight("temp", "2.000,00", cfg)).toMatchObject({ level: "danger", source: "numeric" });
  });

  it("supports regex string rules, including invalid regex patterns (ignored)", () => {
    const cfg = buildHighlightConfig(null, {
      status: {
        string: [
          { when: "regex", value: "^up$", level: "good" },
          { when: "regex", value: "(", level: "danger" }, // invalid; should be ignored
          { when: "equals", value: "DOWN", level: "warn", caseSensitive: true },
        ],
      },
    });

    expect(evaluateHighlight("status", "Up", cfg)).toMatchObject({ level: "good", source: "string" });
    expect(evaluateHighlight("status", "DOWN", cfg)).toMatchObject({ level: "warn", source: "string" });
    expect(evaluateHighlight("status", "Down", cfg)).toBeNull();
  });
});
