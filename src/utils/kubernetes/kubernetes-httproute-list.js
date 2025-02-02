
import { CustomObjectsApi, CoreV1Api } from "@kubernetes/client-node";
import createLogger from "utils/logger";



export async function getHttpRouteList(kc) {
  
    const logger = createLogger("service-helpers");
    const crd = kc.makeApiClient(CustomObjectsApi);
    const core = kc.makeApiClient(CoreV1Api);
    let httpRouteList = [];
  
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