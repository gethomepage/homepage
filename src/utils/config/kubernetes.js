import path from "path";
import { readFileSync } from "fs";

import yaml from "js-yaml";
import { KubeConfig } from "@kubernetes/client-node";

import checkAndCopyConfig from "utils/config/config";

export default function getKubeConfig() {
  checkAndCopyConfig("kubernetes.yaml");

  const configFile = path.join(process.cwd(), "config", "kubernetes.yaml");
  const configData = readFileSync(configFile, "utf8");
  const config = yaml.load(configData);
  const kc = new KubeConfig();

  switch (config?.mode) {
    case 'cluster':
      kc.loadFromCluster();
      break;
    case 'default':
    default:
      kc.loadFromDefault();
  }

  return kc;
}
