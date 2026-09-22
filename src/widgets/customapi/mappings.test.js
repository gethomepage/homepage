import { describe, expect, it } from "vitest";

import { formatValue, getColor, getSize, getValue } from "./mappings";

// A stand-in for i18next's t() that shows which key and value it was called with.
const t = (key, options) => `${key}(${options.value})`;

describe("widgets/customapi/mappings", () => {
  describe("getValue", () => {
    const data = { a: { b: { c: 42 } }, "dotted.key": "flat", list: [1, 2, 3] };

    it("returns the whole payload when no field is given", () => {
      expect(getValue(undefined, data)).toBe(data);
    });

    it("resolves a dotted string path", () => {
      expect(getValue("a.b.c", data)).toBe(42);
      expect(getValue("list.1", data)).toBe(2);
    });

    it("falls back to a literal key when the path does not resolve", () => {
      expect(getValue("dotted.key", data)).toBe("flat");
      expect(getValue("missing.path", data)).toBeNull();
    });

    it("supports the legacy nested-object field form", () => {
      expect(getValue({ a: { b: "c" } }, data)).toBe(42);
      expect(getValue({ a: { x: "c" } }, data)).toBeNull();
      expect(getValue({ nope: "c" }, data)).toBeNull();
    });
  });

  describe("getSize", () => {
    it("counts arrays, strings and object keys, and is NaN otherwise", () => {
      expect(getSize([1, 2, 3])).toBe(3);
      expect(getSize("abcd")).toBe(4);
      expect(getSize({ a: 1, b: 2 })).toBe(2);
      expect(getSize(7)).toBeNaN();
      expect(getSize(null)).toBeNaN();
    });
  });

  describe("formatValue", () => {
    it("remaps by exact value or with any, and stops at the first match", () => {
      const remap = [
        { value: "up", to: "Online" },
        { any: true, to: "Other" },
      ];
      expect(formatValue(t, { remap }, "up")).toBe("Online");
      expect(formatValue(t, { remap }, "down")).toBe("Other");
      expect(formatValue(t, { remap: [{ value: "x", to: "y" }] }, "z")).toBe("z");
    });

    it("scales by a number or by a numerator/denominator string", () => {
      expect(formatValue(t, { scale: 2 }, 21)).toBe(42);
      expect(formatValue(t, { scale: "1/1000" }, 42000)).toBe(42);
      expect(formatValue(t, { scale: "/2" }, 84)).toBe(42);
      expect(formatValue(t, { scale: "3/" }, 14)).toBe(42);
    });

    it("routes each format to the matching translation key", () => {
      expect(formatValue(t, { format: "number" }, "42.9")).toBe("common.number(42)");
      expect(formatValue(t, { format: "float" }, 42.9)).toBe("common.number(42.9)");
      expect(formatValue(t, { format: "percent" }, 0.5)).toBe("common.percent(0.5)");
      expect(formatValue(t, { format: "duration" }, 90)).toBe("common.duration(90)");
      expect(formatValue(t, { format: "bytes" }, 1024)).toBe("common.bytes(1024)");
      expect(formatValue(t, { format: "bitrate" }, 8000)).toBe("common.bitrate(8000)");
      expect(formatValue(t, { format: "size" }, [1, 2])).toBe("common.number(2)");
      expect(formatValue(t, { format: "text" }, "as-is")).toBe("as-is");
      expect(formatValue(t, {}, "as-is")).toBe("as-is");
    });

    it("passes locale and style options through for dates", () => {
      const calls = [];
      const spy = (key, options) => {
        calls.push([key, options]);
        return key;
      };
      formatValue(spy, { format: "date", locale: "de", timeStyle: "short" }, "2026-09-22");
      formatValue(spy, { format: "relativeDate", style: "narrow", numeric: "auto" }, "2026-09-22");
      expect(calls[0]).toEqual([
        "common.date",
        { value: "2026-09-22", lng: "de", dateStyle: "long", timeStyle: "short" },
      ]);
      expect(calls[1]).toEqual([
        "common.relativeDate",
        { value: "2026-09-22", lng: undefined, style: "narrow", numeric: "auto" },
      ]);
    });

    it("applies prefix and suffix around the formatted value", () => {
      expect(formatValue(t, { prefix: "~", suffix: "°C" }, 59.4)).toBe("~ 59.4 °C");
    });
  });

  describe("getColor", () => {
    const data = { up: 3, down: -1 };
    const mapping = (field, color) => ({ additionalField: { field, color } });

    it("picks emerald or rose for adaptive by sign", () => {
      expect(getColor(mapping("up", "adaptive"), data)).toBe("text-emerald-300");
      expect(getColor(mapping("down", "adaptive"), data)).toBe("text-rose-300");
    });

    it("maps the named colors and returns empty for unknown ones", () => {
      expect(getColor(mapping("up", "black"), data)).toBe("text-black");
      expect(getColor(mapping("up", "white"), data)).toBe("text-white");
      expect(getColor(mapping("up", "theme"), data)).toBe("text-theme-500");
      expect(getColor(mapping("up", "purple"), data)).toBe("");
      expect(getColor(mapping("up"), data)).toBe("");
    });
  });
});
