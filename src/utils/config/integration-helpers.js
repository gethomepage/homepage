import { promises as fs } from "fs";
import path from "path";

import Docker from "dockerode";
import yaml from "js-yaml";
import { CustomObjectsApi, NetworkingV1Api, ApiextensionsV1Api } from "@kubernetes/client-node";

import getKubeConfig from "utils/config/kubernetes";
import createLogger from "utils/logger";
import getDockerArguments from "utils/config/docker";
import checkAndCopyConfig, { CONF_DIR, substituteEnvironmentVars } from "utils/config/config";

const logger = createLogger("integration-helpers");

export async function getDockerServers() {
  checkAndCopyConfig("docker.yaml");
  const dockerYaml = path.join(CONF_DIR, "docker.yaml");
  const rawDockerFileContents = await fs.readFile(dockerYaml, "utf8");
  const dockerFileContents = substituteEnvironmentVars(rawDockerFileContents);
  return yaml.load(dockerFileContents);
}

export async function listDockerContainers(servers, serverName) {
  const isSwarm = !!servers[serverName].swarm;
  const docker = new Docker(getDockerArguments(serverName).conn);
  const listProperties = { all: true };
  const containers = await (isSwarm ? docker.listbookmarks(listProperties) : docker.listContainers(listProperties));

  // bad docker connections can result in a <Buffer ...> object?
  // in any case, this ensures the result is the expected array
  if (!Array.isArray(containers)) {
    return [];
  }
  return containers;
}

export function mapObjectsToGroup(servers, objectName) {
  const mappedObjectGroups = [];

  servers.forEach((server) => {
    server[objectName].forEach((serverObject) => {
      let serverGroup = mappedObjectGroups.find((searchedGroup) => searchedGroup.name === serverObject.group);
      if (!serverGroup) {
        const gObject = { name: serverObject.group };
        gObject[objectName] = [];
        mappedObjectGroups.push(gObject);
        serverGroup = mappedObjectGroups[mappedObjectGroups.length - 1];
      }

      const { name: serverObjectName, group: serverObjectGroup, ...pushedObject } = serverObject;
      const result = {
        name: serverObjectName,
        ...pushedObject,
      };

      serverGroup[objectName].push(result);
    });
  });

  return mappedObjectGroups;
}

export function getUrlFromIngress(ingress) {
  const urlHost = ingress.spec.rules[0].host;
  const urlPath = ingress.spec.rules[0].http.paths[0].path;
  const urlSchema = ingress.spec.tls ? "https" : "http";
  return `${urlSchema}://${urlHost}${urlPath}`;
}

export async function checkCRD(kc, name) {
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

export const ANNOTATION_BASE = "gethomepage.dev";
export const ANNOTATION_WIDGET_BASE = `${ANNOTATION_BASE}/widget.`;

export async function getIngressList() {
  checkAndCopyConfig("kubernetes.yaml");

  try {
    const kc = getKubeConfig();
    if (!kc) {
      return [];
    }
    const networking = kc.makeApiClient(NetworkingV1Api);
    const crd = kc.makeApiClient(CustomObjectsApi);

    const ingressList = await networking
      .listIngressForAllNamespaces(null, null, null, null)
      .then((response) => response.body)
      .catch((error) => {
        logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
        return null;
      });

    const traefikContainoExists = await checkCRD(kc, "ingressroutes.traefik.containo.us");
    const traefikExists = await checkCRD(kc, "ingressroutes.traefik.io");

    const traefikIngressListContaino = await crd
      .listClusterCustomObject("traefik.containo.us", "v1alpha1", "ingressroutes")
      .then((response) => response.body)
      .catch(async (error) => {
        if (traefikContainoExists) {
          logger.error(
            "Error getting traefik ingresses from traefik.containo.us: %d %s %s",
            error.statusCode,
            error.body,
            error.response,
          );
        }

        return [];
      });

    const traefikIngressListIo = await crd
      .listClusterCustomObject("traefik.io", "v1alpha1", "ingressroutes")
      .then((response) => response.body)
      .catch(async (error) => {
        if (traefikExists) {
          logger.error(
            "Error getting traefik ingresses from traefik.io: %d %s %s",
            error.statusCode,
            error.body,
            error.response,
          );
        }

        return [];
      });

    const traefikIngressList = [...(traefikIngressListContaino?.items ?? []), ...(traefikIngressListIo?.items ?? [])];

    if (traefikIngressList.length > 0) {
      const traefikServices = traefikIngressList.filter(
        (ingress) => ingress.metadata.annotations && ingress.metadata.annotations[`${ANNOTATION_BASE}/href`],
      );
      ingressList.items.push(...traefikServices);
    }

    return ingressList;
  } catch (e) {
    logger.error(e);
    throw e;
  }
}
