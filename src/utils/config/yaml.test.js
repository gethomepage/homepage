import { describe, expect, it } from "vitest";

import { loadYaml } from "./yaml";

describe("utils/config/yaml", () => {
  it.each(["", "  \n", "# comment only\n"])("loads an empty document from %j as undefined", (input) => {
    expect(loadYaml(input)).toBeUndefined();
  });

  it("loads a populated document", () => {
    expect(loadYaml("title: Homepage\n")).toEqual({ title: "Homepage" });
  });

  it("still rejects invalid YAML", () => {
    expect(() => loadYaml("value: [\n")).toThrow();
  });
});
