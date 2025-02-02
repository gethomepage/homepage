import path from "path";
import { readFileSync } from "fs";

import yaml from "js-yaml";
import { KubeConfig,ApiextensionsV1Api } from "@kubernetes/client-node";

import checkAndCopyConfig, { CONF_DIR, substituteEnvironmentVars } from "utils/config/config";

const extractKubeData = (config) => {
  // kubeconfig
  const kc = new KubeConfig();
  kc.loadFromCluster();

  // route
  const route = config?.route ?? "ingress";

  // traefik
  const traefik = config?.traefik !== "disable";

  return {
    config: kc,
    route,
    traefik,
  };
};

export default function getKubeArguments() {
  checkAndCopyConfig("kubernetes.yaml");

  const configFile = path.join(CONF_DIR, "kubernetes.yaml");
  const rawConfigData = readFileSync(configFile, "utf8");
  const configData = substituteEnvironmentVars(rawConfigData);
  const config = yaml.load(configData);
  let kubeData;

  if (config?.mode === "disabled") {
    kubeData = { config: null };
  } else {
    kubeData = extractKubeData(config);
  }

  return kubeData;
}


export async function checkCRD(name,kc,logger) {
  const apiExtensions = kc.makeApiClient(ApiextensionsV1Api);
  const exist = await apiExtensions
    .readCustomResourceDefinitionStatus(name)
    .then(() => true)
    .catch(async (error) => {
      if (error.statusCode === 403) {
        logger.error(
          "Error checking if CRD %s exists. Make sure to add the following permission to your RBAC: %d %s %s",
          name,
          error.statusCode,
          error.body.message,
        );
      }
      return false;
    });

  return exist;
}