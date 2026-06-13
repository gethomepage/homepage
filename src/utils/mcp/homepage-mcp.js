import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import yaml from "js-yaml";

import { CONF_DIR } from "utils/config/config";

const PROTOCOL_VERSION = "2025-11-25";
const SERVER_INFO = {
  name: "homepage",
  version: "1.0.0",
};

const CONFIG_FILES = [
  "settings.yaml",
  "services.yaml",
  "bookmarks.yaml",
  "widgets.yaml",
  "docker.yaml",
  "kubernetes.yaml",
  "proxmox.yaml",
  "custom.css",
  "custom.js",
];

const YAML_CONFIG_FILES = CONFIG_FILES.filter((file) => file.endsWith(".yaml"));

const DOC_LINKS = {
  "settings.yaml": "https://gethomepage.dev/configs/settings/",
  "services.yaml": "https://gethomepage.dev/configs/services/",
  "bookmarks.yaml": "https://gethomepage.dev/configs/bookmarks/",
  "widgets.yaml": "https://gethomepage.dev/configs/info-widgets/",
  "docker.yaml": "https://gethomepage.dev/configs/docker/",
  "kubernetes.yaml": "https://gethomepage.dev/configs/kubernetes/",
  "proxmox.yaml": "https://gethomepage.dev/configs/proxmox/",
  "custom.css": "https://gethomepage.dev/configs/custom-css-js/",
  "custom.js": "https://gethomepage.dev/configs/custom-css-js/",
};

const FILE_DESCRIPTIONS = {
  "settings.yaml": "Application-level settings such as title, theme, providers, layout, language, and quicklaunch.",
  "services.yaml": "Service groups, links, icons, descriptions, widgets, and status checks shown on the dashboard.",
  "bookmarks.yaml": "Bookmark groups and links shown separately from services.",
  "widgets.yaml": "Information widgets such as resources, search, weather, calendar, and date/time widgets.",
  "docker.yaml": "Docker socket, TLS, and discovery settings for Docker-based automatic service discovery.",
  "kubernetes.yaml": "Kubernetes cluster and ingress discovery settings.",
  "proxmox.yaml": "Proxmox cluster settings used by Proxmox status features.",
  "custom.css": "Optional custom stylesheet loaded by Homepage.",
  "custom.js": "Optional custom JavaScript loaded by Homepage.",
};

function enabled() {
  return process.env.HOMEPAGE_MCP_ENABLED === "true";
}

function writeEnabled() {
  return process.env.HOMEPAGE_MCP_ALLOW_WRITE === "true";
}

function requiredToken() {
  return process.env.HOMEPAGE_MCP_TOKEN;
}

function authEnabled() {
  return Boolean(process.env.HOMEPAGE_AUTH_ENABLED);
}

function jsonRpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id, code, message, data) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: {
      code,
      message,
      ...(data ? { data } : {}),
    },
  };
}

function textContent(text) {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}

function assertKnownConfigFile(file) {
  if (!CONFIG_FILES.includes(file)) {
    throw new Error(`Unsupported config file '${file}'. Supported files: ${CONFIG_FILES.join(", ")}`);
  }
}

function configPath(file) {
  assertKnownConfigFile(file);
  return join(CONF_DIR, file);
}

function fileExists(file) {
  return existsSync(configPath(file));
}

function readConfig(file) {
  const path = configPath(file);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function parseYamlConfig(file) {
  const parsed = yaml.load(readConfig(file) || "");
  return parsed ?? [];
}

function validateYaml(file, content) {
  if (!YAML_CONFIG_FILES.includes(file)) {
    return { valid: true };
  }

  try {
    yaml.load(content || "");
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      mark: error.mark
        ? {
            line: error.mark.line + 1,
            column: error.mark.column + 1,
            snippet: error.mark.snippet,
          }
        : undefined,
    };
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function assertPlainObject(value, name) {
  if (!isPlainObject(value)) {
    throw new Error(`${name} must be an object`);
  }
}

function ensureWriteEnabled() {
  if (!writeEnabled()) {
    return {
      isError: true,
      ...textContent("Writing is disabled. Set HOMEPAGE_MCP_ALLOW_WRITE=true to enable MCP config edits."),
    };
  }
  return null;
}

function dumpYamlConfig(file, content) {
  const dumped = yaml.dump(content, { lineWidth: -1, noRefs: true });
  mkdirSync(CONF_DIR, { recursive: true });
  writeFileSync(configPath(file), dumped, "utf8");
  return dumped;
}

function addService(args) {
  const disabled = ensureWriteEnabled();
  if (disabled) return disabled;

  if (typeof args.group !== "string" || !args.group.trim()) {
    throw new Error("group must be a non-empty string");
  }
  if (typeof args.name !== "string" || !args.name.trim()) {
    throw new Error("name must be a non-empty string");
  }

  const validation = validateYaml("services.yaml", readConfig("services.yaml"));
  if (!validation.valid) {
    return {
      isError: true,
      ...textContent(JSON.stringify(validation, null, 2)),
    };
  }

  const services = parseYamlConfig("services.yaml");
  if (!Array.isArray(services)) {
    throw new Error("services.yaml must contain a top-level array");
  }

  const groupName = args.group.trim();
  const serviceName = args.name.trim();
  const serviceConfig = args.service ?? {};
  assertPlainObject(serviceConfig, "service");

  let group = services.find((entry) => isPlainObject(entry) && Object.keys(entry)[0] === groupName);
  if (!group) {
    group = { [groupName]: [] };
    services.push(group);
  }

  if (!Array.isArray(group[groupName])) {
    throw new Error(`Group '${groupName}' must contain an array`);
  }

  if (group[groupName].some((entry) => isPlainObject(entry) && Object.keys(entry)[0] === serviceName)) {
    return {
      isError: true,
      ...textContent(`Service '${serviceName}' already exists in group '${groupName}'.`),
    };
  }

  group[groupName].push({ [serviceName]: serviceConfig });
  const content = dumpYamlConfig("services.yaml", services);
  return textContent(
    JSON.stringify({ written: "services.yaml", added: { group: groupName, service: serviceName }, content }, null, 2),
  );
}

function addInfoWidget(args) {
  const disabled = ensureWriteEnabled();
  if (disabled) return disabled;

  if (typeof args.type !== "string" || !args.type.trim()) {
    throw new Error("type must be a non-empty string");
  }

  const validation = validateYaml("widgets.yaml", readConfig("widgets.yaml"));
  if (!validation.valid) {
    return {
      isError: true,
      ...textContent(JSON.stringify(validation, null, 2)),
    };
  }

  const widgets = parseYamlConfig("widgets.yaml");
  if (!Array.isArray(widgets)) {
    throw new Error("widgets.yaml must contain a top-level array");
  }

  const type = args.type.trim();
  const options = args.options ?? {};
  assertPlainObject(options, "options");

  widgets.push({ [type]: options });
  const content = dumpYamlConfig("widgets.yaml", widgets);
  return textContent(JSON.stringify({ written: "widgets.yaml", added: { type }, content }, null, 2));
}

function listConfigFiles() {
  return CONFIG_FILES.map((file) => ({
    file,
    exists: fileExists(file),
    writable: writeEnabled(),
    description: FILE_DESCRIPTIONS[file],
    docs: DOC_LINKS[file],
  }));
}

function configResource(file) {
  return {
    uri: `homepage://config/${file}`,
    name: file,
    description: FILE_DESCRIPTIONS[file],
    mimeType: file.endsWith(".yaml") ? "application/yaml" : "text/plain",
  };
}

function parseConfigResourceUri(uri) {
  const prefix = "homepage://config/";
  if (!uri?.startsWith(prefix)) {
    throw new Error("Unsupported resource URI. Use homepage://config/<filename>.");
  }
  const file = uri.slice(prefix.length);
  assertKnownConfigFile(file);
  return file;
}

function toolDefinitions() {
  return [
    {
      name: "list_config_files",
      description:
        "List Homepage config files this server understands, whether they currently exist, and where their docs live.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "read_config_file",
      description:
        "Read one supported Homepage config file from HOMEPAGE_CONFIG_DIR. Missing files return empty content.",
      inputSchema: {
        type: "object",
        properties: {
          file: { type: "string", enum: CONFIG_FILES },
        },
        required: ["file"],
      },
    },
    {
      name: "validate_config_file",
      description:
        "Validate YAML syntax for a supported Homepage config file or supplied content and return line/column details for YAML errors.",
      inputSchema: {
        type: "object",
        properties: {
          file: { type: "string", enum: YAML_CONFIG_FILES },
          content: { type: "string", description: "Optional YAML content to validate instead of reading the file." },
        },
        required: ["file"],
      },
    },
    {
      name: "write_config_file",
      description:
        "Replace a supported Homepage config file. Disabled unless HOMEPAGE_MCP_ALLOW_WRITE=true. YAML files are validated before writing.",
      inputSchema: {
        type: "object",
        properties: {
          file: { type: "string", enum: CONFIG_FILES },
          content: { type: "string" },
        },
        required: ["file", "content"],
      },
    },
    {
      name: "add_service",
      description:
        "Append a service to a group in services.yaml, creating the group if needed. Disabled unless HOMEPAGE_MCP_ALLOW_WRITE=true.",
      inputSchema: {
        type: "object",
        properties: {
          group: { type: "string", description: "Existing or new Homepage service group name." },
          name: { type: "string", description: "Service display name." },
          service: {
            type: "object",
            description:
              "Homepage service properties such as href, icon, description, server, container, widget, or widgets.",
            additionalProperties: true,
          },
        },
        required: ["group", "name"],
      },
    },
    {
      name: "add_info_widget",
      description: "Append an information widget to widgets.yaml. Disabled unless HOMEPAGE_MCP_ALLOW_WRITE=true.",
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Homepage info widget type, for example resources, search, datetime, or openmeteo.",
          },
          options: {
            type: "object",
            description: "Widget options for the selected info widget type.",
            additionalProperties: true,
          },
        },
        required: ["type"],
      },
    },
    {
      name: "homepage_docs",
      description: "Return focused Homepage documentation links for config files and troubleshooting.",
      inputSchema: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            enum: ["overview", ...CONFIG_FILES, "troubleshooting", "widgets"],
          },
        },
      },
    },
  ];
}

function callTool(name, args = {}) {
  switch (name) {
    case "list_config_files":
      return textContent(JSON.stringify({ configDir: CONF_DIR, files: listConfigFiles() }, null, 2));
    case "read_config_file": {
      assertKnownConfigFile(args.file);
      return textContent(readConfig(args.file));
    }
    case "validate_config_file": {
      assertKnownConfigFile(args.file);
      const content = Object.prototype.hasOwnProperty.call(args, "content") ? args.content : readConfig(args.file);
      return textContent(JSON.stringify(validateYaml(args.file, content), null, 2));
    }
    case "write_config_file": {
      const disabled = ensureWriteEnabled();
      if (disabled) return disabled;

      assertKnownConfigFile(args.file);
      if (typeof args.content !== "string") {
        throw new Error("content must be a string");
      }
      const validation = validateYaml(args.file, args.content);
      if (!validation.valid) {
        return {
          isError: true,
          ...textContent(JSON.stringify(validation, null, 2)),
        };
      }
      mkdirSync(CONF_DIR, { recursive: true });
      writeFileSync(configPath(args.file), args.content, "utf8");
      return textContent(
        JSON.stringify({ written: args.file, bytes: Buffer.byteLength(args.content, "utf8") }, null, 2),
      );
    }
    case "add_service":
      return addService(args);
    case "add_info_widget":
      return addInfoWidget(args);
    case "homepage_docs": {
      const topic = args.topic || "overview";
      const links = {
        overview: "https://gethomepage.dev/configs/",
        troubleshooting: "https://gethomepage.dev/troubleshooting/",
        widgets: "https://gethomepage.dev/widgets/",
        ...DOC_LINKS,
      };
      return textContent(JSON.stringify({ topic, url: links[topic] || links.overview }, null, 2));
    }
    default:
      throw new Error(`Unknown tool '${name}'`);
  }
}

export function mcpEnabled() {
  return enabled();
}

export function mcpTokenAuthorized(req) {
  const token = requiredToken();
  if (!token) return false;

  const authHeader = req.headers.authorization;
  return authHeader === `Bearer ${token}` || req.headers["x-homepage-mcp-token"] === token;
}

export function mcpAuthorized(req) {
  return mcpTokenAuthorized(req) || (!requiredToken() && !authEnabled());
}

export function handleMcpRequest(message) {
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return jsonRpcError(message?.id, -32600, "Invalid JSON-RPC request");
  }

  if (message.method.startsWith("notifications/")) {
    return null;
  }

  try {
    switch (message.method) {
      case "initialize":
        return jsonRpcResult(message.id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: {},
            resources: {},
          },
          serverInfo: SERVER_INFO,
          instructions:
            "Homepage MCP helps inspect and validate Homepage YAML configuration. File writes are disabled unless HOMEPAGE_MCP_ALLOW_WRITE=true.",
        });
      case "tools/list":
        return jsonRpcResult(message.id, { tools: toolDefinitions() });
      case "tools/call":
        return jsonRpcResult(message.id, callTool(message.params?.name, message.params?.arguments ?? {}));
      case "resources/list":
        return jsonRpcResult(message.id, { resources: CONFIG_FILES.map(configResource) });
      case "resources/read": {
        const file = parseConfigResourceUri(message.params?.uri);
        return jsonRpcResult(message.id, {
          contents: [
            {
              uri: message.params.uri,
              mimeType: file.endsWith(".yaml") ? "application/yaml" : "text/plain",
              text: readConfig(file),
            },
          ],
        });
      }
      default:
        return jsonRpcError(message.id, -32601, `Method not found: ${message.method}`);
    }
  } catch (error) {
    return jsonRpcError(message.id, -32602, error.message);
  }
}
