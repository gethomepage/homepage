import { CustomObjectsApi, NetworkingV1Api, CoreV1Api } from "@kubernetes/client-node";

import getKubeArguments from "utils/config/kubernetes";
import createLogger from "utils/logger";

const logger = createLogger("service-helpers");

const kubeArguments = getKubeArguments();
const kc = kubeArguments.config;

const apiGroup = "gateway.networking.k8s.io";
const version = "v1";

const getSchemaFromGateway = async (gatewayRef) => {
  const crd = kc.makeApiClient(CustomObjectsApi);
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
    if (ingress.spec.rules[0].matches[0].path.type!="RegularExpression"){
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
  
  const crd = kc.makeApiClient(CustomObjectsApi);
  const core = kc.makeApiClient(CoreV1Api);

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

async function getIngressList(annotationBase) {
  
  const traefik = kubeArguments.traefik;
  const networking = kc.makeApiClient(NetworkingV1Api);

  const ingressList = await networking
    .listIngressForAllNamespaces(null, null, null, null)
    .then((response) => response.body)
    .catch((error) => {
      logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
      logger.debug(error);
      return null;
    });

  if (traefik) {
    const crd = kc.makeApiClient(CustomObjectsApi);
    const traefikContainoExists = await checkCRD("ingressroutes.traefik.containo.us",kc,logger);
    const traefikExists = await checkCRD("ingressroutes.traefik.io",kc,logger);

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
        (ingress) => ingress.metadata.annotations && ingress.metadata.annotations[`${annotationBase}/href`],
      );
      ingressList.items.push(...traefikServices);
    }
  }

  return ingressList.items;
}

export async function getRouteList(annotationBase) {
  let routeList = [];

  if (!kc) {
    return [];
  }

  const routingType = kubeArguments.route;

  switch (routingType) {
    case "ingress":
      routeList = await getIngressList(annotationBase);
      break;
    case "gateway":
      routeList = await getHttpRouteList();
      break;
    default:
      routeList = await getIngressList(annotationBase);
  }

  return routeList;
}

export async function getUrlSchema(route) {
  let urlSchema;
  const routingType = kubeArguments.route;

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
