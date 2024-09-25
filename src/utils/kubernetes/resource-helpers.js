import { CustomObjectsApi } from "@kubernetes/client-node";

import {
  getKubeConfig,
  ANNOTATION_BASE,
  ANNOTATION_WIDGET_BASE,
  HTTPROUTE_API_GROUP,
  HTTPROUTE_API_VERSION,
} from "utils/config/kubernetes";
import { substituteEnvironmentVars } from "utils/config/config";
import createLogger from "utils/logger";
import * as shvl from "utils/config/shvl";

const logger = createLogger("resource-helpers");
const kc = getKubeConfig();

const getSchemaFromGateway = async (parentRef) => {
  const crd = kc.makeApiClient(CustomObjectsApi);
  const schema = await crd
    .getNamespacedCustomObject({
      group: HTTPROUTE_API_GROUP,
      version: HTTPROUTE_API_VERSION,
      namespace: parentRef.namespace,
      plural: "gateways",
      name: parentRef.name,
    })
    .then((response) => {
      const listener =
        response.spec.listeners.find((l) => l.name === parentRef.sectionName) ?? response.spec.listeners[0];

      return listener.protocol.toLowerCase();
    })
    .catch((error) => {
      logger.error("Error getting gateways: %d %s %s", error.statusCode, error.body, error.response);
      logger.debug(error);

      return "http";
    });

  return schema;
};

async function getUrlFromHttpRoute(resource) {
  let url = null;
  const hasHostName = resource.spec?.hostnames;

  if (hasHostName) {
    if (resource.spec.rules[0].matches[0].path.type !== "RegularExpression") {
      const urlHost = resource.spec.hostnames[0];
      const urlPath = resource.spec.rules[0].matches[0].path.value;
      const urlSchema = await getSchemaFromGateway(resource.spec.parentRefs[0]);
      url = `${urlSchema}://${urlHost}${urlPath}`;
    }
  }

  return url;
}

function getUrlFromIngress(resource) {
  const urlHost = resource.spec.rules[0].host;
  const urlPath = resource.spec.rules[0].http.paths[0].path;
  const urlSchema = resource.spec.tls ? "https" : "http";

  return `${urlSchema}://${urlHost}${urlPath}`;
}

async function getUrlSchema(resource) {
  const isHttpRoute = resource.kind === "HTTPRoute";
  let urlSchema;
  if (isHttpRoute) {
    urlSchema = getUrlFromHttpRoute(resource);
  } else {
    urlSchema = getUrlFromIngress(resource);
  }

  return urlSchema;
}

export function isDiscoverable(resource, instanceName) {
  return (
    resource.metadata.annotations &&
    resource.metadata.annotations[`${ANNOTATION_BASE}/enabled`] === "true" &&
    (!resource.metadata.annotations[`${ANNOTATION_BASE}/instance`] ||
      resource.metadata.annotations[`${ANNOTATION_BASE}/instance`] === instanceName ||
      `${ANNOTATION_BASE}/instance.${instanceName}` in resource.metadata.annotations)
  );
}

export async function constructedServiceFromResource(resource) {
  let constructedService = {
    app: resource.metadata.annotations[`${ANNOTATION_BASE}/app`] || resource.metadata.name,
    namespace: resource.metadata.namespace,
    href: resource.metadata.annotations[`${ANNOTATION_BASE}/href`] || (await getUrlSchema(resource)),
    name: resource.metadata.annotations[`${ANNOTATION_BASE}/name`] || resource.metadata.name,
    group: resource.metadata.annotations[`${ANNOTATION_BASE}/group`] || "Kubernetes",
    weight: resource.metadata.annotations[`${ANNOTATION_BASE}/weight`] || "0",
    icon: resource.metadata.annotations[`${ANNOTATION_BASE}/icon`] || "",
    description: resource.metadata.annotations[`${ANNOTATION_BASE}/description`] || "",
    external: false,
    type: "service",
  };
  if (resource.metadata.annotations[`${ANNOTATION_BASE}/external`]) {
    constructedService.external =
      String(resource.metadata.annotations[`${ANNOTATION_BASE}/external`]).toLowerCase() === "true";
  }
  if (resource.metadata.annotations[`${ANNOTATION_BASE}/pod-selector`] !== undefined) {
    constructedService.podSelector = resource.metadata.annotations[`${ANNOTATION_BASE}/pod-selector`];
  }
  if (resource.metadata.annotations[`${ANNOTATION_BASE}/ping`]) {
    constructedService.ping = resource.metadata.annotations[`${ANNOTATION_BASE}/ping`];
  }
  if (resource.metadata.annotations[`${ANNOTATION_BASE}/siteMonitor`]) {
    constructedService.siteMonitor = resource.metadata.annotations[`${ANNOTATION_BASE}/siteMonitor`];
  }
  if (resource.metadata.annotations[`${ANNOTATION_BASE}/statusStyle`]) {
    constructedService.statusStyle = resource.metadata.annotations[`${ANNOTATION_BASE}/statusStyle`];
  }
  if (ingress.metadata.annotations[`${ANNOTATION_BASE}/allowUsers`]) {
    constructedService.allowUsers = ingress.metadata.annotations[`${ANNOTATION_BASE}/allowUsers`].split(",");
  }
  if (ingress.metadata.annotations[`${ANNOTATION_BASE}/allowGroups`]) {
    constructedService.allowGroups = ingress.metadata.annotations[`${ANNOTATION_BASE}/allowGroups`].split(",");
  }

  Object.keys(resource.metadata.annotations).forEach((annotation) => {
    if (annotation.startsWith(ANNOTATION_WIDGET_BASE)) {
      shvl.set(
        constructedService,
        annotation.replace(`${ANNOTATION_BASE}/`, ""),
        resource.metadata.annotations[annotation],
      );
    }
  });

  try {
    constructedService = JSON.parse(substituteEnvironmentVars(JSON.stringify(constructedService)));
  } catch (e) {
    logger.error("Error attempting k8s environment variable substitution.");
    logger.debug(e);
  }

  return constructedService;
}
