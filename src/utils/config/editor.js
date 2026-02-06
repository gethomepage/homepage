import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig, { CONF_DIR } from "utils/config/config";

const YAML_TYPE = "yaml";
const TEXT_TYPE = "text";

export const EDITABLE_CONFIGS = [
  { id: "settings", filename: "settings.yaml", type: YAML_TYPE, label: "Settings" },
  { id: "services", filename: "services.yaml", type: YAML_TYPE, label: "Services" },
  { id: "bookmarks", filename: "bookmarks.yaml", type: YAML_TYPE, label: "Bookmarks" },
  { id: "widgets", filename: "widgets.yaml", type: YAML_TYPE, label: "Widgets" },
  { id: "docker", filename: "docker.yaml", type: YAML_TYPE, label: "Docker" },
  { id: "customCss", filename: "custom.css", type: TEXT_TYPE, label: "Custom CSS" },
  { id: "customJs", filename: "custom.js", type: TEXT_TYPE, label: "Custom JS" },
];

const EDITABLE_CONFIG_MAP = new Map(EDITABLE_CONFIGS.map((config) => [config.id, config]));

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function getBackupDir() {
  return path.join(CONF_DIR, ".backups");
}

function ensureConfigFile(config) {
  const configPath = path.join(CONF_DIR, config.filename);

  if (config.type === YAML_TYPE) {
    checkAndCopyConfig(config.filename);
  }

  if (!existsSync(configPath)) {
    if (!existsSync(CONF_DIR)) {
      mkdirSync(CONF_DIR, { recursive: true });
    }

    const skeletonPath = path.join(process.cwd(), "src", "skeleton", config.filename);
    if (existsSync(skeletonPath)) {
      copyFileSync(skeletonPath, configPath);
    } else {
      writeFileSync(configPath, "", "utf8");
    }
  }

  return configPath;
}

function parseYaml(raw) {
  if (!raw.trim()) {
    return {};
  }

  return yaml.load(raw);
}

function dumpYaml(data) {
  return yaml.dump(data, {
    lineWidth: -1,
    noRefs: true,
  });
}

function parseConfigData(config, raw) {
  if (config.type === YAML_TYPE) {
    return parseYaml(raw);
  }

  return raw;
}

function serializeConfigData(config, data) {
  if (config.type === YAML_TYPE) {
    return dumpYaml(data);
  }

  if (typeof data !== "string") {
    throw new Error("Text configuration must be a string");
  }

  return data;
}

export function getEditableConfig(configId) {
  return EDITABLE_CONFIG_MAP.get(configId);
}

export function listEditableConfigs() {
  return EDITABLE_CONFIGS;
}

export function readEditableConfig(configId) {
  const config = getEditableConfig(configId);
  if (!config) {
    throw new Error("Unsupported config");
  }

  const configPath = ensureConfigFile(config);
  const raw = readFileSync(configPath, "utf8");

  return {
    ...config,
    raw,
    data: parseConfigData(config, raw),
  };
}

export function writeEditableConfig(configId, data) {
  const config = getEditableConfig(configId);
  if (!config) {
    throw new Error("Unsupported config");
  }

  const configPath = ensureConfigFile(config);
  const backupDir = getBackupDir();
  const backupFile = `${config.filename}.${getTimestamp()}.bak`;

  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  copyFileSync(configPath, path.join(backupDir, backupFile));

  const raw = serializeConfigData(config, data);

  if (config.type === YAML_TYPE) {
    // Round-trip parse to ensure we do not persist invalid YAML.
    parseYaml(raw);
  }

  writeFileSync(configPath, raw, "utf8");

  return {
    ...config,
    raw,
    data,
    backupFile,
  };
}
