import { CustomObjectsApi, NetworkingV1Api, CoreV1Api, ApiextensionsV1Api } from "@kubernetes/client-node";

import getKubeArguments from "utils/config/kubernetes";
import createLogger from "utils/logger";

const logger = createLogger("service-helpers");

const kubeArguments = getKubeArguments();
const kc = kubeArguments.config;

const apiGroup = "gateway.networking.k8s.io";
const version = "v1";

let crd;
let core;
let networking;
let routingType;
let traefik;

export async function checkCRD(name) {
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

const getSchemaFromGateway = async (gatewayRef) => {
  const schema = await crd
    .getNamespacedCustomObject(apiGroup, version, gatewayRef.namespace, "gateways", gatewayRef.name)
    .then((response) => {
      const listner = response.body.spec.listeners.filter((listener) => listener.name === gatewayRef.sectionName)[0];
      return listner.protocol.toLowerCase();
    })
    .catch((error) => {
      logger.error("Error getting gateways: %d %s %s", error.statusCode, error.body, error.response);
      logger.debug(error);
      return "";
    });
  return schema;
};

async function getUrlFromHttpRoute(ingress) {

  let url = null
  if (ingress.spec.has("hostnames")) {
    if (ingress.spec.rules[0].matches[0].path.type=="PathPrefix"){
      const urlHost = ingress.spec.hostnames[0];
      const urlPath = ingress.spec.rules[0].matches[0].path.value;
      const urlSchema = (await getSchemaFromGateway(ingress.spec.parentRefs[0])) ? "https" : "http";
      url = `${urlSchema}://${urlHost}${urlPath}`;
    }
  } 
  return url;
}

function getUrlFromIngress(ingress) {
  const urlHost = ingress.spec.rules[0].host;
  const urlPath = ingress.spec.rules[0].http.paths[0].path;
  const urlSchema = ingress.spec.tls ? "https" : "http";
  return `${urlSchema}://${urlHost}${urlPath}`;
}

async function getHttpRouteList() {
  // httproutes
  const getHttpRoute = async (namespace) =>
    crd
      .listNamespacedCustomObject(apiGroup, version, namespace, "httproutes")
      .then((response) => {
        const [httpRoute] = response.body.items;
        return httpRoute;
      })
      .catch((error) => {
        logger.error("Error getting httproutes: %d %s %s", error.statusCode, error.body, error.response);
        logger.debug(error);
        return null;
      });

  // namespaces
  const namespaces = await core
    .listNamespace()
    .then((response) => response.body.items.map((ns) => ns.metadata.name))
    .catch((error) => {
      logger.error("Error getting namespaces: %d %s %s", error.statusCode, error.body, error.response);
      logger.debug(error);
      return null;
    });

  let httpRouteList = [];
  if (namespaces) {
    const httpRouteListUnfiltered = await Promise.all(
      namespaces.map(async (namespace) => {
        const httpRoute = await getHttpRoute(namespace);
        return httpRoute;
      }),
    );

    httpRouteList = httpRouteListUnfiltered.filter((httpRoute) => httpRoute !== undefined);
  }
  return httpRouteList;
}

async function getIngressList(ANNOTATION_BASE) {
  const ingressList = await networking
    .listIngressForAllNamespaces(null, null, null, null)
    .then((response) => response.body)
    .catch((error) => {
      logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
      logger.debug(error);
      return null;
    });

  if (traefik) {
    const traefikContainoExists = await checkCRD("ingressroutes.traefik.containo.us");
    const traefikExists = await checkCRD("ingressroutes.traefik.io");

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
          logger.debug(error);
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
          logger.debug(error);
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
  }

  return ingressList.items;
}

export async function getRouteList(ANNOTATION_BASE) {
  let routeList = [];

  if (!kc) {
    return [];
  }

  crd = kc.makeApiClient(CustomObjectsApi);
  core = kc.makeApiClient(CoreV1Api);
  networking = kc.makeApiClient(NetworkingV1Api);

  routingType = kubeArguments.route;
  traefik = kubeArguments.traefik;

  switch (routingType) {
    case "ingress":
      routeList = await getIngressList(ANNOTATION_BASE);
      break;
    case "gateway":
      routeList = await getHttpRouteList();
      break;
    default:
      routeList = await getIngressList(ANNOTATION_BASE);
  }

  return routeList;
}

export async function getUrlSchema(route) {
  let urlSchema;

  switch (routingType) {
    case "ingress":
      urlSchema = getUrlFromIngress(route);
      break;
    case "gateway":
      urlSchema = await getUrlFromHttpRoute(route);
      break;
    default:
      urlSchema = getUrlFromIngress(route);
  }
  return urlSchema;
}
