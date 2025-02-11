import { CustomObjectsApi, CoreV1Api } from "@kubernetes/client-node";

import { getKubernetes, getKubeConfig, HTTPROUTE_API_GROUP, HTTPROUTE_API_VERSION } from "utils/config/kubernetes";
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
    const getHttpRoute = async (namespace) =>
      crd
        .listNamespacedCustomObject({
          group: HTTPROUTE_API_GROUP,
          version: HTTPROUTE_API_VERSION,
          namespace,
          plural: "httproutes",
        })
        .then((response) => {
          const [httpRoute] = response.items;
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
      .then((response) => response.items.map((ns) => ns.metadata.name))
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
