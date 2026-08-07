import { CustomObjectsApi } from "@kubernetes/client-node";

import { getKubeConfig, getKubernetes, HTTPROUTE_API_GROUP, HTTPROUTE_API_VERSION } from "utils/config/kubernetes";
import createLogger from "utils/logger";

const logger = createLogger("httproute-list");
const kc = getKubeConfig();

export default async function listHttpRoute() {
  const { gateway } = getKubernetes();

  if (gateway) {
    const crd = kc.makeApiClient(CustomObjectsApi);

    const httpRoutes = await crd
      .listClusterCustomObject({
        group: HTTPROUTE_API_GROUP,
        version: HTTPROUTE_API_VERSION,
        plural: "httproutes",
      })
      .then((response) => {
        return response?.items ?? [];
      })
      .catch((error) => {
        logger.error("Error getting httproutes: %d %s %s", error.statusCode, error.body, error.response);
        logger.debug(error);
        return [];
      });

    return httpRoutes;
  }

  return [];
}
