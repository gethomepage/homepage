

import { CustomObjectsApi, NetworkingV1Api, CoreV1Api, ApiextensionsV1Api } from "@kubernetes/client-node";
import getKubeArguments from "utils/config/kubernetes";
import createLogger from "utils/logger";

const logger = createLogger("service-helpers");

const kubeArguments = getKubeArguments();
const kc = kubeArguments.config;

const apiGroup = 'gateway.networking.k8s.io';
const version = 'v1';

let crd;
let core;
let networking;
let routingType;
let traefik;


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

const getSchemaFromGateway = async (gatewayRef) => {
    try {
        const gateway = await crd.getNamespacedCustomObject(apiGroup, version, gatewayRef.namespace,"gateways",gatewayRef.name);
        const listener = gateway.body.spec.listeners.filter((listener)=>listener.name==gatewayRef.sectionName)[0];
        return listener.protocol.toLowerCase();
    } catch (err) {
        console.error(err);
    }
};

async function getUrlFromHttpRoute(ingress) {
    const urlHost = ingress.spec.hostnames[0];
    const urlPath = ingress.spec.rules[0].matches[0].path.value;
    const urlSchema = await getSchemaFromGateway(ingress.spec.parentRefs[0]) ? "https" : "http";
    // const urlSchema = "https"
    return `${urlSchema}://${urlHost}${urlPath}`;
}
  
  
function getUrlFromIngress(ingress) {
    const urlHost = ingress.spec.rules[0].host;
    const urlPath = ingress.spec.rules[0].http.paths[0].path;
    const urlSchema = ingress.spec.tls ? "https" : "http";
    return `${urlSchema}://${urlHost}${urlPath}`;
}

async function getHttpRouteList(){
    const httpRouteList = new Array();

    const namespaces = await core.listNamespace()
    .then((response) => response.body.items.map(ns => ns.metadata.name))
    .catch((error) => {
        logger.error("Error getting namespaces: %d %s %s", error.statusCode, error.body, error.response);
        logger.debug(error);
        return null;
      })

    if (namespaces){
        // Iterate over each namespace
        for (const namespace of namespaces) {
            try {
            // Fetch the httproute from one namespaces
            const httpRoute = await crd.listNamespacedCustomObject(apiGroup,version,namespace,'httproutes');
            if (httpRoute.body.items.length !== 0){
                httpRouteList.push(httpRoute.body.items[0]);
            }
            
            } catch (err) {
            console.error(`Error fetching httproutes objects in namespace "${namespace}":`, err.body || err.message);
            }
        }
    }
    return httpRouteList;
}

async function getIngressList(){

  const ingressList = await networking
  .listIngressForAllNamespaces(null, null, null, null)
  .then((response) => response.body)
  .catch((error) => {
    logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
    logger.debug(error);
    return null;
  });

  if (traefik){
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

export async function getRouteList(){

  let routeList = new Array();

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
      routeList = await getIngressList();
      break;
    case "gateway":
      routeList = await getHttpRouteList();
      break;
    default:
      routeList = await getIngressList();
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