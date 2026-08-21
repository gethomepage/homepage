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

  it("preserves v4 handling of non-string keys", () => {
    // an unsubstituted {{HOMEPAGE_VAR_*}} parses as a flow mapping key
    expect(loadYaml("- Plex:\n    widget:\n      key: {{HOMEPAGE_VAR_PLEX_KEY}}\n")).toEqual([
      { Plex: { widget: { key: { "[object Object]": null } } } },
    ]);
    expect(loadYaml("- Backups:\n    - 2024-01-01:\n        href: http://x\n")).toEqual([
      { Backups: [{ [String(new Date("2024-01-01T00:00:00.000Z"))]: { href: "http://x" } }] },
    ]);
  });

  it("still rejects invalid YAML", () => {
    expect(() => loadYaml("value: [\n")).toThrow();
  });
});
