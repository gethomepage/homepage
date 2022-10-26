import { CoreV1Api, Metrics } from "@kubernetes/client-node";

import getKubeConfig from "../../../utils/config/kubernetes";
import { parseCpu, parseMemory } from "../../../utils/kubernetes/kubernetes-utils";
import createLogger from "../../../utils/logger";

const logger = createLogger("kubernetes-widget");

export default async function handler(req, res) {
  const { type } = req.query;

  try {
    const kc = getKubeConfig();
    const coreApi = kc.makeApiClient(CoreV1Api);
    const metricsApi = new Metrics(kc);

    const nodes = await coreApi.listNode()
      .then((response) => response.body)
      .catch((error) => {
        logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
        return null;
      });
    if (!nodes) {
      return res.status(500).send({
        error: "unknown error"
      });
    }
    const nodeCapacity = new Map();
    let cpuTotal = 0;
    let cpuUsage = 0;
    let memTotal = 0;
    let memUsage = 0;

    nodes.items.forEach((node) => {
      nodeCapacity.set(node.metadata.name, node.status.capacity);
      cpuTotal += Number.parseInt(node.status.capacity.cpu, 10);
      memTotal += parseMemory(node.status.capacity.memory);
    });

    const nodeMetrics = await metricsApi.getNodeMetrics();
    const nodeUsage = new Map();
    nodeMetrics.items.forEach((metrics) => {
      nodeUsage.set(metrics.metadata.name, metrics.usage);
      cpuUsage += parseCpu(metrics.usage.cpu);
      memUsage += parseMemory(metrics.usage.memory);
    });

    if (type === "cpu") {
      return res.status(200).json({
        cpu: {
          usage: (cpuUsage / cpuTotal) * 100,
          load: cpuUsage
        }
      });
    }

    if (type === "memory") {
      const SCALE_MB = 1024 * 1024;
      const usedMemMb = memUsage / SCALE_MB;
      const totalMemMb = memTotal / SCALE_MB;
      const freeMemMb = totalMemMb - usedMemMb;
      return res.status(200).json({
        memory: {
          usedMemMb,
          freeMemMb,
          totalMemMb
        }
      });
    }

    return res.status(400).json({
      error: "invalid type"
    });
  } catch (e) {
    logger.error("exception %s", e);
    return res.status(500).send({
      error: "unknown error"
    });
  }
}
