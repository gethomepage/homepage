import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadMcpWithConfigDir(configDir) {
  vi.resetModules();
  process.env.HOMEPAGE_CONFIG_DIR = configDir;
  return import("./homepage-mcp");
}

describe("utils/mcp/homepage-mcp", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("is disabled by default", async () => {
    delete process.env.HOMEPAGE_MCP_ENABLED;

    const mod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    expect(mod.mcpEnabled()).toBe(false);
  });

  it("returns initialize capabilities", async () => {
    const mod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    const response = mod.handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });

    expect(response.result.protocolVersion).toBe("2025-11-25");
    expect(response.result.capabilities).toEqual({ tools: {}, resources: {} });
  });

  it("lists Homepage configuration tools", async () => {
    const mod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    const response = mod.handleMcpRequest({ jsonrpc: "2.0", id: 2, method: "tools/list" });

    expect(response.result.tools.map((tool) => tool.name)).toContain("validate_config_file");
    expect(response.result.tools.map((tool) => tool.name)).toContain("write_config_file");
  });

  it("validates YAML and reports line and column details", async () => {
    const mod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    const response = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "validate_config_file",
        arguments: {
          file: "services.yaml",
          content: "- Group:\n  - Broken: [",
        },
      },
    });

    const validation = JSON.parse(response.result.content[0].text);
    expect(validation.valid).toBe(false);
    expect(validation.mark.line).toBeGreaterThan(0);
    expect(validation.mark.column).toBeGreaterThan(0);
  });

  it("does not write configuration files unless write mode is enabled", async () => {
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    const mod = await loadMcpWithConfigDir(configDir);

    const response = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "write_config_file",
        arguments: {
          file: "settings.yaml",
          content: "title: Test\n",
        },
      },
    });

    expect(response.result.isError).toBe(true);
  });

  it("writes valid YAML when write mode is enabled", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    const mod = await loadMcpWithConfigDir(configDir);

    const response = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "write_config_file",
        arguments: {
          file: "settings.yaml",
          content: "title: Test\n",
        },
      },
    });

    expect(response.result.isError).toBeUndefined();
    expect(readFileSync(path.join(configDir, "settings.yaml"), "utf8")).toBe("title: Test\n");
  });

  it("reads config resources", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    const mod = await loadMcpWithConfigDir(configDir);

    mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "write_config_file",
        arguments: {
          file: "bookmarks.yaml",
          content: "- Links: []\n",
        },
      },
    });

    const response = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 7,
      method: "resources/read",
      params: { uri: "homepage://config/bookmarks.yaml" },
    });

    expect(response.result.contents[0].text).toBe("- Links: []\n");
  });
});
