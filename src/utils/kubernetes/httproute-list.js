import { CoreV1Api, CustomObjectsApi } from "@kubernetes/client-node";

import { getKubeConfig, getKubernetes, HTTPROUTE_API_GROUP, HTTPROUTE_API_VERSION } from "utils/config/kubernetes";
import createLogger from "utils/logger";

const logger = createLogger("httproute-list");
const kc = getKubeConfig();

export default async function listHttpRoute() {
  const crd = kc.makeApiClient(CustomObjectsApi);
  const core = kc.makeApiClient(CoreV1Api);
  const { gateway } = getKubernetes();
  let httpRouteList = [];

  if (gateway) {
    // httproutes
    const getHttpRoutes = async (namespace) =>
      crd
        .listNamespacedCustomObject({
          group: HTTPROUTE_API_GROUP,
          version: HTTPROUTE_API_VERSION,
          namespace,
          plural: "httproutes",
        })
        .then((response) => {
          return response.items;
        })
        .catch((error) => {
          logger.error("Error getting httproutes: %d %s %s", error.statusCode, error.body, error.response);
          logger.debug(error);
          return null;
        });
    // namespaces
    const namespaces = await core
      .listNamespace()
      .then((response) => response.items.map((ns) => ns.metadata.name))
      .catch((error) => {
        logger.error("Error getting namespaces: %d %s %s", error.statusCode, error.body, error.response);
        logger.debug(error);
        return null;
      });

    if (namespaces) {
      const httpRouteListUnfiltered = await Promise.all(
        namespaces.map(async (namespace) => {
          const httpRoutes = await getHttpRoutes(namespace);
          return httpRoutes;
        }),
      );

      httpRouteList = httpRouteListUnfiltered.flat().filter((httpRoute) => httpRoute);
    }
  }
  return httpRouteList;
}
