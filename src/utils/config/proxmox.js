import { readFileSync } from "fs";

import yaml from "js-yaml";

import checkAndCopyConfig, { getConfigPath, substituteEnvironmentVars } from "utils/config/config";

export function getProxmoxConfig() {
  checkAndCopyConfig("proxmox.yaml");
  const configFile = getConfigPath("proxmox.yaml");
  const rawConfigData = readFileSync(configFile, "utf8");
  const configData = substituteEnvironmentVars(rawConfigData);
  return yaml.load(configData);
}
