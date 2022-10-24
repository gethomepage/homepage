import { CoreV1Api } from "@kubernetes/client-node";

import getKubeConfig from "../../../../utils/config/kubernetes";

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
    const coreApi = kc.makeApiClient(CoreV1Api);
    const podsResponse = await coreApi.listNamespacedPod(namespace, null, null, null, null, labelSelector);
    const pods = podsResponse.body.items;

    if (pods.length === 0) {
      res.status(200).send({
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
  } catch {
    res.status(500).send({
      error: "unknown error",
    });
  }
}
