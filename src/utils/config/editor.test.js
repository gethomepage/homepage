import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("utils/config/editor", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("reads default editable config entries", async () => {
    const mod = await import("./editor");
    const entries = mod.listEditableConfigs();

    expect(entries.some((entry) => entry.id === "settings")).toBe(true);
    expect(entries.some((entry) => entry.id === "customCss")).toBe(true);
  });

  it("writes yaml config and creates a backup", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "homepage-editor-test-"));
    process.env.HOMEPAGE_CONFIG_DIR = dir;

    writeFileSync(path.join(dir, "settings.yaml"), "title: before\n", "utf8");

    vi.resetModules();
    const mod = await import("./editor");

    const result = mod.writeEditableConfig("settings", { title: "after" });

    expect(result.backupFile).toMatch(/settings\.yaml\..+\.bak/);
    expect(readFileSync(path.join(dir, "settings.yaml"), "utf8")).toContain("title: after");

    const backupDir = path.join(dir, ".backups");
    expect(existsSync(backupDir)).toBe(true);
    const backups = readdirSync(backupDir);
    expect(backups.length).toBe(1);
    expect(readFileSync(path.join(backupDir, backups[0]), "utf8")).toContain("title: before");
  });

  it("rejects invalid text payload types", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "homepage-editor-test-"));
    process.env.HOMEPAGE_CONFIG_DIR = dir;

    vi.resetModules();
    const mod = await import("./editor");

    expect(() => mod.writeEditableConfig("customCss", { bad: true })).toThrow("Text configuration must be a string");
  });
});
