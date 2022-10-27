import { CoreV1Api } from "@kubernetes/client-node";

import getKubeConfig from "../../../../utils/config/kubernetes";
import createLogger from "../../../../utils/logger";

const logger = createLogger("kubernetesStatusService");

export default async function handler(req, res) {
  const APP_LABEL =  "app.kubernetes.io/name";
  const { service } = req.query;

  const [namespace, appName] = service;
  if (!namespace && !appName) {
    res.status(400).send({
      error: "kubernetes query parameters are required",
    });
    return;
  }
  const labelSelector = `${APP_LABEL}=${appName}`;

  try {
    const kc = getKubeConfig();
    if (!kc) {
      res.status(500).send({
        error: "No kubernetes configuration"
      });
      return;
    }
    const coreApi = kc.makeApiClient(CoreV1Api);
    const podsResponse = await coreApi.listNamespacedPod(namespace, null, null, null, null, labelSelector)
      .then((response) => response.body)
      .catch((err) => {
        logger.error("Error getting pods: %d %s %s", err.statusCode, err.body, err.response);
        return null;
      });
    if (!podsResponse) {
      res.status(500).send({
        error: "Error communicating with kubernetes"
      });
      return;
    }
    const pods = podsResponse.items;

    if (pods.length === 0) {
      res.status(404).send({
        error: "not found",
      });
      return;
    }

    // at least one pod must be in the "Running" phase, otherwise its "down"
    const runningPod = pods.find(pod => pod.status.phase === "Running");
    const status = runningPod ? "running" : "down";
    res.status(200).json({
      status
    });
  } catch (e) {
    logger.error(e);
    res.status(500).send({
      error: "unknown error",
    });
  }
}
