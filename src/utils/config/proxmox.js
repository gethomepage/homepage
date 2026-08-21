import { readFileSync } from "fs";
import path from "path";

import checkAndCopyConfig, { CONF_DIR, substituteEnvironmentVars } from "utils/config/config";
import { loadYaml } from "utils/config/yaml";

export function getProxmoxConfig() {
  checkAndCopyConfig("proxmox.yaml");
  const configFile = path.join(CONF_DIR, "proxmox.yaml");
  const rawConfigData = readFileSync(configFile, "utf8");
  const configData = substituteEnvironmentVars(rawConfigData);
  return loadYaml(configData);
}
