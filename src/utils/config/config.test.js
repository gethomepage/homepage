import { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import cache from "memory-cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("utils/config/config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    cache.del("homepageEnvironmentVariables");
  });

  afterEach(() => {
    process.env = originalEnv;
    cache.del("homepageEnvironmentVariables");
  });

  it("substituteEnvironmentVars replaces HOMEPAGE_VAR_* placeholders", async () => {
    process.env.HOMEPAGE_VAR_FOO = "bar";

    const mod = await import("./config");
    expect(mod.substituteEnvironmentVars("x {{HOMEPAGE_VAR_FOO}} y")).toBe("x bar y");
  });

  it("substituteEnvironmentVars replaces HOMEPAGE_FILE_* placeholders with file contents", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "homepage-config-test-"));
    const secretPath = path.join(dir, "secret.txt");
    writeFileSync(secretPath, "secret", "utf8");

    process.env.HOMEPAGE_FILE_SECRET = secretPath;

    const mod = await import("./config");
    expect(mod.substituteEnvironmentVars("token={{HOMEPAGE_FILE_SECRET}}")).toBe("token=secret");
  });

  it.each(["pa$$word", "pa$&word", "pa$`word", "pa$'word", "pa$1word"])(
    "substituteEnvironmentVars preserves literal environment value %j in every occurrence",
    async (secret) => {
      process.env.HOMEPAGE_VAR_SECRET = secret;

      const mod = await import("./config");
      expect(
        mod.substituteEnvironmentVars("before {{HOMEPAGE_VAR_SECRET}} between {{HOMEPAGE_VAR_SECRET}} after"),
      ).toBe(`before ${secret} between ${secret} after`);
    },
  );

  it.each(["pa$$word", "pa$&word", "pa$`word", "pa$'word", "pa$1word"])(
    "substituteEnvironmentVars preserves literal secret file contents %j in every occurrence",
    async (secret) => {
      const dir = mkdtempSync(path.join(tmpdir(), "homepage-config-test-"));
      const secretPath = path.join(dir, "secret.txt");
      writeFileSync(secretPath, secret, "utf8");

      try {
        process.env.HOMEPAGE_FILE_SECRET = secretPath;

        const mod = await import("./config");
        expect(
          mod.substituteEnvironmentVars("before {{HOMEPAGE_FILE_SECRET}} between {{HOMEPAGE_FILE_SECRET}} after"),
        ).toBe(`before ${secret} between ${secret} after`);
      } finally {
        unlinkSync(secretPath);
        rmdirSync(dir);
      }
    },
  );

  it("getSettings reads from HOMEPAGE_CONFIG_DIR and converts layout list to an object", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "homepage-settings-test-"));
    process.env.HOMEPAGE_CONFIG_DIR = dir;
    process.env.HOMEPAGE_VAR_TITLE = "MyTitle";

    // Create a minimal settings.yaml; checkAndCopyConfig will see it exists and won't copy skeleton.
    writeFileSync(
      path.join(dir, "settings.yaml"),
      ['title: "{{HOMEPAGE_VAR_TITLE}}"', "layout:", "  - GroupA:", "      style: row"].join("\n"),
      "utf8",
    );

    vi.resetModules(); // ensure CONF_DIR is computed from updated env
    const mod = await import("./config");

    const settings = mod.getSettings();
    expect(settings.title).toBe("MyTitle");
    expect(settings.layout).toEqual({ GroupA: { style: "row" } });
  });
});
