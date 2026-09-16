import { CustomObjectsApi } from "@kubernetes/client-node";

import { substituteEnvironmentVars } from "utils/config/config";
import {
  ANNOTATION_BASE,
  ANNOTATION_WIDGET_BASE,
  getKubeConfig,
  getKubernetes,
  HTTPROUTE_API_GROUP,
  HTTPROUTE_API_VERSION,
} from "utils/config/kubernetes";
import * as shvl from "utils/config/shvl";
import createLogger from "utils/logger";

const logger = createLogger("resource-helpers");
const kc = getKubeConfig();

const getSchemaFromGateway = async (parentRef, routeNamespace) => {
  const crd = kc.makeApiClient(CustomObjectsApi);
  const schema = await crd
    .getNamespacedCustomObject({
      group: HTTPROUTE_API_GROUP,
      version: HTTPROUTE_API_VERSION,
      // parentRef namespace is optional, defaults to the route's namespace
      namespace: parentRef.namespace ?? routeNamespace,
      plural: "gateways",
      name: parentRef.name,
    })
    .then((response) => {
      const listener =
        response.spec.listeners.find((l) => l.name === parentRef.sectionName) ?? response.spec.listeners[0];

      return listener.protocol.toLowerCase();
    })
    .catch((error) => {
      logger.error("Error getting gateways: %s", error.body ?? error.message);
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
      const urlSchema = await getSchemaFromGateway(resource.spec.parentRefs[0], resource.metadata.namespace);
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

function getSchemaFromServicePort(port) {
  if (port.port === 443 || /https/i.test(port.name ?? "")) {
    return "https";
  }
  return "http";
}

function isDefaultServicePortForSchema(schema, port) {
  return (schema === "https" && port === 443) || (schema === "http" && port === 80);
}

function getUrlFromService(resource) {
  const port = resource.spec?.ports?.[0];

  if (resource.spec?.type === "ExternalName" && resource.spec?.externalName) {
    const urlSchema = port ? getSchemaFromServicePort(port) : "http";
    const portSuffix = port && !isDefaultServicePortForSchema(urlSchema, port.port) ? `:${port.port}` : "";
    return `${urlSchema}://${resource.spec.externalName}${portSuffix}`;
  }

  if (!port) {
    logger.error(
      "Service %s/%s has no ports defined; cannot construct a URL.",
      resource.metadata.namespace,
      resource.metadata.name,
    );
    return null;
  }

  logger.warn(
    "Service %s/%s has no ExternalName and no href annotation; falling back to a cluster-internal URL.",
    resource.metadata.namespace,
    resource.metadata.name,
  );

  const urlSchema = getSchemaFromServicePort(port);
  const portSuffix = isDefaultServicePortForSchema(urlSchema, port.port) ? "" : `:${port.port}`;
  const { clusterDomain = "cluster.local" } = getKubernetes() ?? {};
  return `${urlSchema}://${resource.metadata.name}.${resource.metadata.namespace}.svc.${clusterDomain}${portSuffix}`;
}

async function getUrlSchema(resource) {
  switch (resource.kind) {
    case "HTTPRoute":
      return getUrlFromHttpRoute(resource);
    case "Service":
      return getUrlFromService(resource);
    default:
      return getUrlFromIngress(resource);
  }
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
