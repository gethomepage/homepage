
import { CustomObjectsApi, CoreV1Api } from "@kubernetes/client-node";

import createLogger from "utils/logger";

const logger = createLogger("kubernetes-httproute-list");
const HTTPROUTE_API_GROUP = "gateway.networking.k8s.io";
const HTTPROUTE_API_VERSION = "v1";

export default async function listHttpRoute(kubeArguments) {
  
    const crd = kubeArguments.config.makeApiClient(CustomObjectsApi);
    const core = kubeArguments.config.makeApiClient(CoreV1Api);
    const { gateway } = kubeArguments;
    let httpRouteList = [];

    if (gateway === true) {
      // httproutes
      const getHttpRoute = async (namespace) =>
        crd
          .listNamespacedCustomObject(HTTPROUTE_API_GROUP, HTTPROUTE_API_VERSION, namespace, "httproutes")
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
    
      if (namespaces) {
        const httpRouteListUnfiltered = await Promise.all(
          namespaces.map(async (namespace) => {
            const httpRoute = await getHttpRoute(namespace);
            return httpRoute;
          }),
        );
    
        httpRouteList = httpRouteListUnfiltered.filter((httpRoute) => httpRoute !== undefined);
      }
  }
  return httpRouteList;
}