import { describe, expect, it } from "vitest";

import { parseCpu, parseMemory } from "./utils";

describe("utils/kubernetes/utils", () => {
  it("parses cpu units into core values", () => {
    expect(parseCpu("500m")).toBeCloseTo(0.5);
    expect(parseCpu("250u")).toBeCloseTo(0.00025);
    expect(parseCpu("1000n")).toBeCloseTo(0.000001);
    expect(parseCpu("5x")).toBe(5);
    expect(parseCpu("2")).toBe(2);
  });

  it("parses memory units into numeric values", () => {
    expect(parseMemory("1Gi")).toBe(1000000000);
    expect(parseMemory("1G")).toBe(1024 * 1024 * 1024);
    expect(parseMemory("1Mi")).toBe(1000000);
    expect(parseMemory("1M")).toBe(1024 * 1024);
    expect(parseMemory("1Ki")).toBe(1000);
    expect(parseMemory("1K")).toBe(1024);
    expect(parseMemory("3Ti")).toBe(3);
    expect(parseMemory("256")).toBe(256);
  });
});
