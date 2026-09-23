import { describe, expect, it } from "vitest";

import { formatValue, getColor, getSize, getValue } from "./utils";

const t = (key, { value }) => `${key.replace("common.", "")}:${value}`;

const data = {
  status: "online",
  stats: { cpu: 12.5, change: -1.2, users: ["a", "b"] },
  "dotted.key": 7,
};

describe("widgets/customapi/utils", () => {
  it.each([
    ["the root when no field is set", undefined, data],
    ["a dotted path", "stats.cpu", 12.5],
    ["a literal key containing a dot", "dotted.key", 7],
    ["null for a missing path", "stats.missing", null],
    ["a legacy object path", { stats: "cpu" }, 12.5],
    ["null for a legacy path through a missing key", { missing: "cpu" }, null],
    ["null for an empty legacy path", {}, null],
  ])("getValue returns %s", (_, field, expected) => {
    expect(getValue(field, data)).toEqual(expected);
  });

  it.each([
    [["a", "b", "c"], 3],
    ["abcd", 4],
    [{ a: 1, b: 2 }, 2],
    [null, NaN],
    [5, NaN],
  ])("getSize(%j) is %s", (input, expected) => {
    expect(getSize(input)).toEqual(expected);
  });

  it.each([
    [{}, "raw", "raw"],
    [{ format: "number" }, "42.9", "number:42"],
    [{ format: "float" }, 4.2, "number:4.2"],
    [{ format: "percent", scale: 100 }, 0.25, "percent:25"],
    [{ format: "duration" }, 90, "duration:90"],
    [{ format: "bytes", scale: "1024/1" }, 2, "bytes:2048"],
    [{ format: "bitrate", scale: "/8" }, 800, "bitrate:100"],
    [{ format: "date" }, "2026-09-22", "date:2026-09-22"],
    [{ format: "relativeDate" }, "2026-09-22", "relativeDate:2026-09-22"],
    [{ format: "size" }, ["a", "b"], "number:2"],
    [
      {
        remap: [
          { value: 0, to: "Off" },
          { value: 1, to: "On" },
        ],
      },
      1,
      "On",
    ],
    [
      {
        remap: [
          { value: "ok", to: "Healthy" },
          { any: true, to: "Unknown" },
        ],
      },
      "degraded",
      "Unknown",
    ],
    [{ format: "number", prefix: "$", suffix: "USD" }, 10, "$ number:10 USD"],
  ])("formatValue with %j formats %j as %j", (mapping, raw, expected) => {
    expect(formatValue(t, mapping, raw)).toBe(expected);
  });

  it.each([
    ["adaptive", "stats.cpu", "text-emerald-300"],
    ["adaptive", "stats.change", "text-rose-300"],
    ["black", "stats.cpu", "text-black"],
    ["white", "stats.cpu", "text-white"],
    ["theme", "stats.cpu", "text-theme-500"],
    [undefined, "stats.cpu", ""],
  ])("getColor %s for %s is %j", (color, field, expected) => {
    expect(getColor({ additionalField: { field, color } }, data)).toBe(expected);
  });
});
