import { describe, expect, it } from "vitest";

import { loadYaml } from "./yaml";

describe("utils/config/yaml", () => {
  it.each(["", "  \n", "# comment only\n"])("loads an empty document from %j as undefined", (input) => {
    expect(loadYaml(input)).toBeUndefined();
  });

  it("loads a populated document", () => {
    expect(loadYaml("title: Homepage\n")).toEqual({ title: "Homepage" });
  });

  it("preserves v4 merge key behavior", () => {
    expect(loadYaml("defaults: &defaults\n  href: https://example.com\nservice:\n  <<: *defaults\n")).toEqual({
      defaults: { href: "https://example.com" },
      service: { href: "https://example.com" },
    });
  });

  it("preserves v4 timestamp behavior without enabling YAML 1.1 booleans", () => {
    expect(loadYaml("date: 2026-08-21\nenabled: yes\n")).toEqual({
      date: new Date("2026-08-21T00:00:00.000Z"),
      enabled: "yes",
    });
  });

  it("still rejects invalid YAML", () => {
    expect(() => loadYaml("value: [\n")).toThrow();
  });
});
