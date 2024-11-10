import path from "path";
import { readFileSync } from "fs";

import yaml from "js-yaml";
import { KubeConfig } from "@kubernetes/client-node";

import checkAndCopyConfig, { CONF_DIR, substituteEnvironmentVars } from "utils/config/config";

const extractKubeData = (config) => {
  // kubeconfig
  const kc = new KubeConfig();
  kc.loadFromCluster();

  // route
  let route = "ingress";
  if (config?.route === "gateway") {
    route = "gateway";
  }

  // traefik
  let traefik = true;
  if (config?.traefik === "disable") {
    traefik = false;
  }

  return { 
    "config": kc, 
    "route": route, 
    "traefik": traefik
  };
};

export default function getKubeArguments() {
  checkAndCopyConfig("kubernetes.yaml");

  const configFile = path.join(CONF_DIR, "kubernetes.yaml");
  const rawConfigData = readFileSync(configFile, "utf8");
  const configData = substituteEnvironmentVars(rawConfigData);
  const config = yaml.load(configData);
  let kubeData;

  switch (config?.mode) {
    case "cluster":
      kubeData = extractKubeData(config);
      break;
    case "default":
      kubeData = extractKubeData(config);
      break;
    case "disabled":
    default:
      kubeData = null;
  }

  return kubeData;
}
