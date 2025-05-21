import { NetworkingV1Api } from "@kubernetes/client-node";

import { getKubeConfig, getKubernetes } from "utils/config/kubernetes";
import createLogger from "utils/logger";

const logger = createLogger("ingress-list");
const kc = getKubeConfig();

export default async function listIngress() {
  const networking = kc.makeApiClient(NetworkingV1Api);
  const { ingress = true } = getKubernetes();
  let ingressList = [];

  if (ingress) {
    const ingressData = await networking
      .listIngressForAllNamespaces()
      .then((response) => response)
      .catch((error) => {
        logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
        logger.debug(error);
        return null;
      });
    ingressList = ingressData.items;
  }
  return ingressList;
}
