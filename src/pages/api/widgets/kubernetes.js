import { CoreV1Api, Metrics } from "@kubernetes/client-node";

import getKubeConfig from "../../../utils/config/kubernetes";
import { parseCpu, parseMemory } from "../../../utils/kubernetes/kubernetes-utils";
import createLogger from "../../../utils/logger";

const logger = createLogger("kubernetes-widget");

export default async function handler(req, res) {
  try {
    const kc = getKubeConfig();
    if (!kc) {
      return res.status(500).send({
        error: "No kubernetes configuration",
      });
    }
    const coreApi = kc.makeApiClient(CoreV1Api);
    const metricsApi = new Metrics(kc);

    const nodes = await coreApi
      .listNode()
      .then((response) => response.body)
      .catch((error) => {
        logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
        return null;
      });
    if (!nodes) {
      return res.status(500).send({
        error: "unknown error",
      });
    }
    let cpuTotal = 0;
    let cpuUsage = 0;
    let memTotal = 0;
    let memUsage = 0;

    const nodeMap = {};
    nodes.items.forEach((node) => {
      const cpu = Number.parseInt(node.status.capacity.cpu, 10);
      const mem = parseMemory(node.status.capacity.memory);
      const ready =
        node.status.conditions.filter((condition) => condition.type === "Ready" && condition.status === "True").length >
        0;
      nodeMap[node.metadata.name] = {
        name: node.metadata.name,
        ready,
        cpu: {
          total: cpu,
        },
        memory: {
          total: mem,
        },
      };
      cpuTotal += cpu;
      memTotal += mem;
    });

    try {
      const nodeMetrics = await metricsApi.getNodeMetrics();
      nodeMetrics.items.forEach((nodeMetric) => {
        const cpu = parseCpu(nodeMetric.usage.cpu);
        const mem = parseMemory(nodeMetric.usage.memory);
        cpuUsage += cpu;
        memUsage += mem;
        nodeMap[nodeMetric.metadata.name].cpu.load = cpu;
        nodeMap[nodeMetric.metadata.name].cpu.percent = (cpu / nodeMap[nodeMetric.metadata.name].cpu.total) * 100;
        nodeMap[nodeMetric.metadata.name].memory.used = mem;
        nodeMap[nodeMetric.metadata.name].memory.free = nodeMap[nodeMetric.metadata.name].memory.total - mem;
        nodeMap[nodeMetric.metadata.name].memory.percent = (mem / nodeMap[nodeMetric.metadata.name].memory.total) * 100;
      });
    } catch (error) {
      logger.error("Error getting metrics, ensure you have metrics-server installed: s", JSON.stringify(error));
      return res.status(500).send({
        error: "Error getting metrics, check logs for more details",
      });
    }

    const cluster = {
      cpu: {
        load: cpuUsage,
        total: cpuTotal,
        percent: (cpuUsage / cpuTotal) * 100,
      },
      memory: {
        used: memUsage,
        total: memTotal,
        free: memTotal - memUsage,
        percent: (memUsage / memTotal) * 100,
      },
    };

    return res.status(200).json({
      cluster,
      nodes: Object.entries(nodeMap).map(([name, node]) => ({ name, ...node })),
    });
  } catch (e) {
    if (e) logger.error(e);
    return res.status(500).send({
      error: "unknown error",
    });
  }
}
