import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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
    expect(response.result.tools.map((tool) => tool.name)).toContain("add_service");
    expect(response.result.tools.map((tool) => tool.name)).toContain("add_info_widget");
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

  it("adds a service to a new group when write mode is enabled", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    const mod = await loadMcpWithConfigDir(configDir);

    const response = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 8,
      method: "tools/call",
      params: {
        name: "add_service",
        arguments: {
          group: "Media",
          name: "Plex",
          service: {
            href: "https://plex.example.com",
            icon: "plex.png",
            description: "Movies and TV",
            widget: {
              type: "plex",
              url: "https://plex.example.com",
              key: "secret",
            },
          },
        },
      },
    });

    expect(response.result.isError).toBeUndefined();
    expect(readFileSync(path.join(configDir, "services.yaml"), "utf8")).toBe(
      "- Media:\n" +
        "    - Plex:\n" +
        "        href: https://plex.example.com\n" +
        "        icon: plex.png\n" +
        "        description: Movies and TV\n" +
        "        widget:\n" +
        "          type: plex\n" +
        "          url: https://plex.example.com\n" +
        "          key: secret\n",
    );
  });

  it("does not add a duplicate service in the same group", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    const mod = await loadMcpWithConfigDir(configDir);
    const request = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "add_service",
        arguments: {
          group: "Media",
          name: "Plex",
          service: { href: "https://plex.example.com" },
        },
      },
    };

    mod.handleMcpRequest({ ...request, id: 9 });
    const response = mod.handleMcpRequest({ ...request, id: 10 });

    expect(response.result.isError).toBe(true);
    expect(response.result.content[0].text).toContain("already exists");
  });

  it("adds an info widget when write mode is enabled", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    const mod = await loadMcpWithConfigDir(configDir);

    const response = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 11,
      method: "tools/call",
      params: {
        name: "add_info_widget",
        arguments: {
          type: "openmeteo",
          options: {
            label: "Current",
            latitude: 36.66,
            longitude: -117.51,
            cache: 5,
          },
        },
      },
    });

    expect(response.result.isError).toBeUndefined();
    expect(readFileSync(path.join(configDir, "widgets.yaml"), "utf8")).toBe(
      "- openmeteo:\n" +
        "    label: Current\n" +
        "    latitude: 36.66\n" +
        "    longitude: -117.51\n" +
        "    cache: 5\n",
    );
  });

  it("does not add services or info widgets unless write mode is enabled", async () => {
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    const mod = await loadMcpWithConfigDir(configDir);

    const serviceResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 12,
      method: "tools/call",
      params: {
        name: "add_service",
        arguments: {
          group: "Media",
          name: "Plex",
        },
      },
    });
    const widgetResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 13,
      method: "tools/call",
      params: {
        name: "add_info_widget",
        arguments: {
          type: "resources",
        },
      },
    });

    expect(serviceResponse.result.isError).toBe(true);
    expect(widgetResponse.result.isError).toBe(true);
  });

  it("lists config file metadata and resources", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    writeFileSync(path.join(configDir, "settings.yaml"), "title: Test\n");
    const mod = await loadMcpWithConfigDir(configDir);

    const filesResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 14,
      method: "tools/call",
      params: { name: "list_config_files" },
    });
    const resourcesResponse = mod.handleMcpRequest({ jsonrpc: "2.0", id: 15, method: "resources/list" });

    const files = JSON.parse(filesResponse.result.content[0].text).files;
    expect(files.find((file) => file.file === "settings.yaml")).toMatchObject({
      exists: true,
      writable: true,
      docs: "https://gethomepage.dev/configs/settings/",
    });
    expect(files.find((file) => file.file === "services.yaml").exists).toBe(false);
    expect(resourcesResponse.result.resources.map((resource) => resource.uri)).toContain(
      "homepage://config/custom.css",
    );
  });

  it("reads missing files and non-YAML resources as empty text", async () => {
    const mod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    const readResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 16,
      method: "tools/call",
      params: {
        name: "read_config_file",
        arguments: { file: "custom.css" },
      },
    });
    const resourceResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 17,
      method: "resources/read",
      params: { uri: "homepage://config/custom.css" },
    });

    expect(readResponse.result.content[0].text).toBe("");
    expect(resourceResponse.result.contents[0]).toMatchObject({
      mimeType: "text/plain",
      text: "",
    });
  });

  it("validates non-YAML files and can validate file contents from disk", async () => {
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    writeFileSync(path.join(configDir, "settings.yaml"), "title: Test\n");
    const mod = await loadMcpWithConfigDir(configDir);

    const cssResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 18,
      method: "tools/call",
      params: {
        name: "validate_config_file",
        arguments: { file: "custom.css", content: "body {" },
      },
    });
    const yamlResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 19,
      method: "tools/call",
      params: {
        name: "validate_config_file",
        arguments: { file: "settings.yaml" },
      },
    });

    expect(JSON.parse(cssResponse.result.content[0].text)).toEqual({ valid: true });
    expect(JSON.parse(yamlResponse.result.content[0].text)).toEqual({ valid: true });
  });

  it("returns JSON-RPC errors for invalid requests and unknown methods", async () => {
    const mod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    const invalidResponse = mod.handleMcpRequest({ id: 20, method: "tools/list" });
    const unknownMethodResponse = mod.handleMcpRequest({ jsonrpc: "2.0", id: 21, method: "unknown/method" });
    const notificationResponse = mod.handleMcpRequest({ jsonrpc: "2.0", method: "notifications/initialized" });

    expect(invalidResponse.error).toMatchObject({ code: -32600, message: "Invalid JSON-RPC request" });
    expect(unknownMethodResponse.error).toMatchObject({ code: -32601, message: "Method not found: unknown/method" });
    expect(notificationResponse).toBeNull();
  });

  it("returns JSON-RPC errors for unsupported files, resources, and tools", async () => {
    const mod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    const unsupportedFileResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 22,
      method: "tools/call",
      params: {
        name: "read_config_file",
        arguments: { file: "secrets.yaml" },
      },
    });
    const badResourceResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 23,
      method: "resources/read",
      params: { uri: "homepage://unknown/settings.yaml" },
    });
    const unknownToolResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 24,
      method: "tools/call",
      params: { name: "missing_tool" },
    });

    expect(unsupportedFileResponse.error).toMatchObject({ code: -32602 });
    expect(unsupportedFileResponse.error.message).toContain("Unsupported config file");
    expect(badResourceResponse.error).toMatchObject({
      code: -32602,
      message: "Unsupported resource URI. Use homepage://config/<filename>.",
    });
    expect(unknownToolResponse.error).toMatchObject({ code: -32602, message: "Unknown tool 'missing_tool'" });
  });

  it("rejects invalid write_config_file arguments and YAML", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const mod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    const nonStringResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 25,
      method: "tools/call",
      params: {
        name: "write_config_file",
        arguments: { file: "settings.yaml", content: { title: "Test" } },
      },
    });
    const invalidYamlResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 26,
      method: "tools/call",
      params: {
        name: "write_config_file",
        arguments: { file: "settings.yaml", content: "title: [" },
      },
    });

    expect(nonStringResponse.error).toMatchObject({ code: -32602, message: "content must be a string" });
    expect(invalidYamlResponse.result.isError).toBe(true);
    expect(JSON.parse(invalidYamlResponse.result.content[0].text).valid).toBe(false);
  });

  it("adds a service to an existing group", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    writeFileSync(
      path.join(configDir, "services.yaml"),
      "- Media:\n    - Jellyfin:\n        href: https://jellyfin.example.com\n",
    );
    const mod = await loadMcpWithConfigDir(configDir);

    const response = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 27,
      method: "tools/call",
      params: {
        name: "add_service",
        arguments: {
          group: "Media",
          name: "Plex",
          service: { href: "https://plex.example.com" },
        },
      },
    });

    expect(response.result.isError).toBeUndefined();
    expect(readFileSync(path.join(configDir, "services.yaml"), "utf8")).toContain("    - Jellyfin:");
    expect(readFileSync(path.join(configDir, "services.yaml"), "utf8")).toContain("    - Plex:");
  });

  it("rejects invalid add_service arguments and existing file shapes", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const invalidArgsMod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    expect(
      invalidArgsMod.handleMcpRequest({
        jsonrpc: "2.0",
        id: 28,
        method: "tools/call",
        params: { name: "add_service", arguments: { group: "", name: "Plex" } },
      }).error.message,
    ).toBe("group must be a non-empty string");
    expect(
      invalidArgsMod.handleMcpRequest({
        jsonrpc: "2.0",
        id: 29,
        method: "tools/call",
        params: { name: "add_service", arguments: { group: "Media", name: " " } },
      }).error.message,
    ).toBe("name must be a non-empty string");
    expect(
      invalidArgsMod.handleMcpRequest({
        jsonrpc: "2.0",
        id: 30,
        method: "tools/call",
        params: { name: "add_service", arguments: { group: "Media", name: "Plex", service: [] } },
      }).error.message,
    ).toBe("service must be an object");

    const invalidYamlDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    writeFileSync(path.join(invalidYamlDir, "services.yaml"), "- Media:\n  - Broken: [");
    const invalidYamlMod = await loadMcpWithConfigDir(invalidYamlDir);
    const invalidYamlResponse = invalidYamlMod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 31,
      method: "tools/call",
      params: { name: "add_service", arguments: { group: "Media", name: "Plex" } },
    });
    expect(invalidYamlResponse.result.isError).toBe(true);

    const nonArrayDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    writeFileSync(path.join(nonArrayDir, "services.yaml"), "Media: []\n");
    const nonArrayMod = await loadMcpWithConfigDir(nonArrayDir);
    expect(
      nonArrayMod.handleMcpRequest({
        jsonrpc: "2.0",
        id: 32,
        method: "tools/call",
        params: { name: "add_service", arguments: { group: "Media", name: "Plex" } },
      }).error.message,
    ).toBe("services.yaml must contain a top-level array");

    const nonArrayGroupDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    writeFileSync(path.join(nonArrayGroupDir, "services.yaml"), "- Media: {}\n");
    const nonArrayGroupMod = await loadMcpWithConfigDir(nonArrayGroupDir);
    expect(
      nonArrayGroupMod.handleMcpRequest({
        jsonrpc: "2.0",
        id: 33,
        method: "tools/call",
        params: { name: "add_service", arguments: { group: "Media", name: "Plex" } },
      }).error.message,
    ).toBe("Group 'Media' must contain an array");
  });

  it("rejects invalid add_info_widget arguments and existing file shapes", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const invalidArgsMod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    expect(
      invalidArgsMod.handleMcpRequest({
        jsonrpc: "2.0",
        id: 34,
        method: "tools/call",
        params: { name: "add_info_widget", arguments: { type: "" } },
      }).error.message,
    ).toBe("type must be a non-empty string");
    expect(
      invalidArgsMod.handleMcpRequest({
        jsonrpc: "2.0",
        id: 35,
        method: "tools/call",
        params: { name: "add_info_widget", arguments: { type: "resources", options: [] } },
      }).error.message,
    ).toBe("options must be an object");

    const invalidYamlDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    writeFileSync(path.join(invalidYamlDir, "widgets.yaml"), "- resources: [");
    const invalidYamlMod = await loadMcpWithConfigDir(invalidYamlDir);
    const invalidYamlResponse = invalidYamlMod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 36,
      method: "tools/call",
      params: { name: "add_info_widget", arguments: { type: "resources" } },
    });
    expect(invalidYamlResponse.result.isError).toBe(true);

    const nonArrayDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    writeFileSync(path.join(nonArrayDir, "widgets.yaml"), "resources: {}\n");
    const nonArrayMod = await loadMcpWithConfigDir(nonArrayDir);
    expect(
      nonArrayMod.handleMcpRequest({
        jsonrpc: "2.0",
        id: 37,
        method: "tools/call",
        params: { name: "add_info_widget", arguments: { type: "resources" } },
      }).error.message,
    ).toBe("widgets.yaml must contain a top-level array");
  });

  it("adds an info widget with default options", async () => {
    process.env.HOMEPAGE_MCP_ALLOW_WRITE = "true";
    const configDir = mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-"));
    const mod = await loadMcpWithConfigDir(configDir);

    const response = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 38,
      method: "tools/call",
      params: { name: "add_info_widget", arguments: { type: "resources" } },
    });

    expect(response.result.isError).toBeUndefined();
    expect(readFileSync(path.join(configDir, "widgets.yaml"), "utf8")).toBe("- resources: {}\n");
  });

  it("returns documentation links with default and fallback topics", async () => {
    const mod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    const defaultResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 39,
      method: "tools/call",
      params: { name: "homepage_docs" },
    });
    const fallbackResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 40,
      method: "tools/call",
      params: { name: "homepage_docs", arguments: { topic: "not-real" } },
    });
    const fileResponse = mod.handleMcpRequest({
      jsonrpc: "2.0",
      id: 41,
      method: "tools/call",
      params: { name: "homepage_docs", arguments: { topic: "services.yaml" } },
    });

    expect(JSON.parse(defaultResponse.result.content[0].text)).toEqual({
      topic: "overview",
      url: "https://gethomepage.dev/configs/",
    });
    expect(JSON.parse(fallbackResponse.result.content[0].text)).toEqual({
      topic: "not-real",
      url: "https://gethomepage.dev/configs/",
    });
    expect(JSON.parse(fileResponse.result.content[0].text)).toEqual({
      topic: "services.yaml",
      url: "https://gethomepage.dev/configs/services/",
    });
  });

  it("checks MCP token and auth mode authorization", async () => {
    const mod = await loadMcpWithConfigDir(mkdtempSync(path.join(tmpdir(), "homepage-mcp-test-")));

    expect(mod.mcpTokenAuthorized({ headers: {} })).toBe(false);
    expect(mod.mcpAuthorized({ headers: {} })).toBe(true);

    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    expect(mod.mcpAuthorized({ headers: {} })).toBe(false);

    process.env.HOMEPAGE_MCP_TOKEN = "secret";
    expect(mod.mcpTokenAuthorized({ headers: { authorization: "Bearer secret" } })).toBe(true);
    expect(mod.mcpTokenAuthorized({ headers: { "x-homepage-mcp-token": "secret" } })).toBe(true);
    expect(mod.mcpTokenAuthorized({ headers: { authorization: "Bearer wrong" } })).toBe(false);
    expect(mod.mcpAuthorized({ headers: { authorization: "Bearer secret" } })).toBe(true);
  });
});
