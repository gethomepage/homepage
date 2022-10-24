import { CoreV1Api, Metrics } from "@kubernetes/client-node";

import getKubeConfig from "../../../../utils/config/kubernetes";
import { parseCpu, parseMemory } from "../../../../utils/kubernetes/kubernetes-utils";

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
    const metricsApi = new Metrics(kc);
    const podsResponse = await coreApi.listNamespacedPod(namespace, null, null, null, null, labelSelector);
    const pods = podsResponse.body.items;

    if (pods.length === 0) {
      res.status(200).send({
        error: "not found",
      });
      return;
    }

    let cpuLimit = 0;
    let memLimit = 0;
    pods.forEach((pod) => {
      pod.spec.containers.forEach((container) => {
        if (container?.resources?.limits?.cpu) {
          cpuLimit += parseCpu(container?.resources?.limits?.cpu);
        }
        if (container?.resources?.limits?.memory) {
          memLimit += parseMemory(container?.resources?.limits?.memory);
        }
      });
    });

    const stats = await pods.map(async (pod) => {
      let depMem = 0;
      let depCpu = 0;
      const podMetrics = await metricsApi.getPodMetrics(namespace, pod.metadata.name);
      podMetrics.containers.forEach((container) => {
        depMem += parseMemory(container.usage.memory);
        depCpu += parseCpu(container.usage.cpu);
      });
      return {
        mem: depMem,
        cpu: depCpu
      }
    }).reduce(async (finalStats, podStatPromise) => {
      const podStats = await podStatPromise;
      return {
        mem: finalStats.mem + podStats.mem,
        cpu: finalStats.cpu + podStats.cpu
      };
    });
    stats.cpuLimit = cpuLimit;
    stats.memLimit = memLimit;
    stats.cpuUsage = stats.cpu / cpuLimit;
    stats.memUsage = stats.mem / memLimit;

    res.status(200).json({
      stats,
    });
  } catch (e) {
    console.log("error", e);
    res.status(500).send({
      error: "unknown error",
    });
  }
}
