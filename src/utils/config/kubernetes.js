import path from "path";
import { readFileSync } from "fs";

import yaml from "js-yaml";
import { KubeConfig } from "@kubernetes/client-node";

import checkAndCopyConfig, { CONF_DIR, substituteEnvironmentVars } from "utils/config/config";

export default function getKubernetesConfig() {
  checkAndCopyConfig("kubernetes.yaml");

  const configFile = path.join(CONF_DIR, "kubernetes.yaml");
  const rawConfigData = readFileSync(configFile, "utf8");
  const configData = substituteEnvironmentVars(rawConfigData);
  return yaml.load(configData);
}

export function makeKubeConfig(config) {
  const kc = new KubeConfig();

  switch (config?.mode) {
    case "cluster":
      kc.loadFromCluster();
      break;
    case "default":
      kc.loadFromDefault();
      break;
    case "disabled":
    default:
      return null;
  }

  return kc;
}
