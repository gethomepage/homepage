import { CoreV1Api } from "@kubernetes/client-node";

import { getKubeConfig, getKubernetes } from "utils/config/kubernetes";
import createLogger from "utils/logger";

const logger = createLogger("service-list");
const kc = getKubeConfig();

export default async function listService() {
  const core = kc.makeApiClient(CoreV1Api);
  const { service = false } = getKubernetes();
  let serviceList = [];

  if (service) {
    const serviceData = await core
      .listServiceForAllNamespaces()
      .then((response) => response)
      .catch((error) => {
        logger.error("Error getting services: %d %s %s", error.statusCode, error.body, error.response);
        logger.debug(error);
        return null;
      });
    serviceList = serviceData?.items ?? [];
  }
  return serviceList;
}
