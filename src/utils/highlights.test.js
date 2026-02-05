import { describe, expect, it } from "vitest";

import { buildHighlightConfig, evaluateHighlight, getHighlightClass } from "./highlights";

describe("utils/highlights", () => {
  it("returns null when there are no levels and no fields to evaluate", () => {
    const cfg = buildHighlightConfig(
      null,
      {
        levels: { good: null, warn: null, danger: null },
      },
      "x",
    );

    expect(cfg).toBeNull();
  });

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

  it("normalizes field keys by trimming and skipping blank/null entries", () => {
    const cfg = buildHighlightConfig(
      null,
      {
        levels: { good: null, warn: null, danger: null, custom: "x" },
        "  cpu  ": { numeric: { when: "gt", value: 1, level: "custom" } },
        "": { numeric: { when: "gt", value: 1, level: "danger" } },
        empty: null,
      },
      "resources",
    );

    expect(cfg.fields.cpu).toBeTruthy();
    expect(cfg.fields["resources.cpu"]).toBeTruthy();
    expect(cfg.fields.empty).toBeUndefined();
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

  it("evaluateHighlight stringifies booleans and applies case-sensitive string rules", () => {
    const cfg = buildHighlightConfig(null, {
      enabled: { string: { when: "equals", value: "true", caseSensitive: true, level: "good" } },
      suffix: { string: { when: "endsWith", value: "World", caseSensitive: true, level: "warn" } },
    });

    expect(evaluateHighlight("enabled", true, cfg)).toMatchObject({ level: "good", source: "string" });
    expect(evaluateHighlight("suffix", "HelloWorld", cfg)).toMatchObject({ level: "warn", source: "string" });
    expect(evaluateHighlight("suffix", "helloworld", cfg)).toBeNull();
  });

  it("evaluateHighlight supports string rules (case-insensitive includes)", () => {
    const cfg = buildHighlightConfig(null, { status: { string: { when: "includes", value: "down", level: "warn" } } });

    const hit = evaluateHighlight("status", "Service DOWN", cfg);
    expect(hit).toMatchObject({ level: "warn", source: "string" });
  });

  it("getHighlightClass returns configured class for a level", () => {
    const cfg = buildHighlightConfig({ levels: { danger: "danger-class" } }, {}, "x");
    expect(getHighlightClass("danger", cfg)).toBe("danger-class");
    expect(getHighlightClass("missing", cfg)).toBeUndefined();
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

  it("supports numeric parsing for dot/comma thousands formats", () => {
    const cfg = buildHighlightConfig(null, {
      num: { numeric: { when: "eq", value: 1234.56, level: "good" } },
      grouped: { numeric: { when: "eq", value: 1234567, level: "warn" } },
    });

    expect(evaluateHighlight("num", "1,234.56", cfg)).toMatchObject({ level: "good", source: "numeric" });
    expect(evaluateHighlight("grouped", "1.234.567", cfg)).toMatchObject({ level: "warn", source: "numeric" });
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

  it("parses numeric strings with commas/dots/spaces and supports stringified numeric rule values", () => {
    const cfg = buildHighlightConfig(null, {
      // string numeric rule values go through toNumber()
      gt: { numeric: { when: "gt", value: "5", level: "warn" } },
      commaGrouped: { numeric: { when: "eq", value: 1234, level: "good" } },
      commaDecimal: { numeric: { when: "eq", value: 12.34, level: "good" } },
      dotDecimal: { numeric: { when: "eq", value: 12.34, level: "good" } },
      spaceGrouped: { numeric: { when: "eq", value: 1234, level: "good" } },
    });

    expect(evaluateHighlight("gt", "6", cfg)).toMatchObject({ level: "warn", source: "numeric" });
    expect(evaluateHighlight("commaGrouped", "1,234", cfg)).toMatchObject({ level: "good", source: "numeric" });
    expect(evaluateHighlight("commaDecimal", "12,34", cfg)).toMatchObject({ level: "good", source: "numeric" });
    // Include a space so Number(trimmed) fails and we exercise the dot parsing branch.
    expect(evaluateHighlight("dotDecimal", "12 .34", cfg)).toMatchObject({ level: "good", source: "numeric" });
    expect(evaluateHighlight("spaceGrouped", "1 234", cfg)).toMatchObject({ level: "good", source: "numeric" });
  });

  it("treats unparseable numeric formats as non-numeric", () => {
    const cfg = buildHighlightConfig(null, {
      num: { numeric: { when: "gt", value: 0, level: "warn" } },
    });

    // Invalid comma grouping should not be treated as numeric.
    expect(evaluateHighlight("num", "1,2,3", cfg)).toBeNull();

    // "1.2.3" is not a valid grouped or decimal number for our parser.
    expect(evaluateHighlight("num", "1.2.3", cfg)).toBeNull();

    // JSX-ish values should not be treated as numeric.
    expect(evaluateHighlight("num", { props: { children: "x" } }, cfg)).toBeNull();
  });

  it("falls through numeric evaluation when numeric rules do not match", () => {
    const cfg = buildHighlightConfig(null, {
      status: {
        numeric: { when: "gte", value: 100, level: "danger" },
        string: { when: "includes", value: "ok", level: "good" },
      },
    });

    // Numeric rule doesn't match, string rule does.
    expect(evaluateHighlight("status", "ok", cfg)).toMatchObject({ level: "good", source: "string" });
  });

  it("stringifies numbers/bigints for string evaluation and ignores unknown numeric operators", () => {
    const cfg = buildHighlightConfig(null, {
      // unknown numeric operator should not match
      weird: { numeric: { when: "nope", value: 1, level: "warn" } },
      // bigint should stringify to match a string rule
      big: { string: { when: "equals", value: "9007199254740993", level: "good", caseSensitive: true } },
    });

    expect(evaluateHighlight("weird", "10", cfg)).toBeNull();
    expect(evaluateHighlight("big", 9007199254740993n, cfg)).toMatchObject({ level: "good", source: "string" });
  });
});
