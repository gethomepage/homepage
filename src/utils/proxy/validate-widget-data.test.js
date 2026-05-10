import { beforeEach, describe, expect, it, vi } from "vitest";

const { loggerError } = vi.hoisted(() => ({
  loggerError: vi.fn(),
}));

vi.mock("utils/logger", () => ({
  default: () => ({
    error: loggerError,
  }),
}));

vi.mock("widgets/widgets", () => ({
  default: {
    test: {
      mappings: {
        foo: {
          endpoint: "foo",
          validate: ["a", "b"],
        },
        empty: {
          endpoint: "empty",
          allowEmpty: true,
        },
      },
    },
  },
}));

import validateWidgetData from "./validate-widget-data";

describe("utils/proxy/validate-widget-data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when buffer JSON cannot be parsed", () => {
    expect(validateWidgetData({ type: "test" }, "foo", Buffer.from("not json"))).toBe(false);
    expect(loggerError).toHaveBeenCalled();
  });

  it("retries parsing after stripping whitespace (e.g. vertical tab) and validates required keys", () => {
    // JSON.parse allows only a subset of whitespace; vertical tab triggers a parse error.
    const data = Buffer.from(`{\u000B"a": 1, "b": 2}`);
    expect(validateWidgetData({ type: "test" }, "foo", data)).toBe(true);
  });

  it("returns false when required validate keys are missing", () => {
    expect(validateWidgetData({ type: "test" }, "foo", Buffer.from(JSON.stringify({ a: 1 })))).toBe(false);
    expect(loggerError).toHaveBeenCalled();
  });

  it("allows empty buffer responses for mappings that explicitly allow them", () => {
    expect(validateWidgetData({ type: "test" }, "empty", Buffer.from(""))).toBe(true);
    expect(loggerError).not.toHaveBeenCalled();
  });
});
