import Docker from "dockerode";

import { getSettings } from "utils/config/config";
import getDockerArguments from "utils/config/docker";
import { containersFromConfig, hasHomepageLabels } from "utils/config/service-helpers";
import { calculateCPUPercent, calculateThroughput, calculateUsedMemory } from "utils/docker/stats-helpers";

// mem and network are omitted when docker does not report them, so the widget can skip those blocks
async function statsForContainer(docker, id) {
  try {
    const raw = await docker.getContainer(id).stats({ stream: false });
    const stats = { cpu: calculateCPUPercent(raw) };

    if (raw.memory_stats?.usage) {
      stats.mem = calculateUsedMemory(raw);
    }

    if (raw.networks) {
      const { rxBytes, txBytes } = calculateThroughput(raw);
      stats.rx = rxBytes;
      stats.tx = txBytes;
    }

    return stats;
  } catch {
    return undefined;
  }
}

export async function getDockerStats(server) {
  const dockerArgs = getDockerArguments(server);
  const docker = new Docker(dockerArgs.conn);

  const [containers, configured] = await Promise.all([
    docker.listContainers({ all: true }),
    containersFromConfig(server),
  ]);

  if (!Array.isArray(containers)) {
    return { error: "query failed" };
  }

  const { instanceName } = getSettings();
  const targets = {};
  const localIds = new Set();

  containers.forEach((container) => {
    localIds.add(container.Id);
    if (container.State !== "running") return;

    const labelled = hasHomepageLabels(container.Labels, instanceName);
    container.Names.forEach((name) => {
      const containerName = name.replace(/^\//, "");
      if (labelled || configured.has(containerName)) targets[containerName] = container.Id;
    });
  });

  if (dockerArgs.swarm) {
    const [services, tasks] = await Promise.all([
      docker.listServices().catch(() => []),
      docker.listTasks({ filters: { "desired-state": ["running"] } }).catch(() => []),
    ]);

    const tasksByService = {};
    tasks.forEach((task) => {
      (tasksByService[task.ServiceID] ??= []).push(task);
    });

    services.forEach((service) => {
      const name = service.Spec?.Name;
      if (!name || targets[name]) return;
      if (!configured.has(name) && !hasHomepageLabels(service.Spec?.Labels, instanceName)) return;

      // stats are only available for containers running on this node
      const serviceTasks = tasksByService[service.ID] ?? [];
      const task = serviceTasks.find((candidate) => localIds.has(candidate.Status?.ContainerStatus?.ContainerID));
      const containerId = task?.Status?.ContainerStatus?.ContainerID;
      if (containerId) targets[name] = containerId;
    });
  }

  const names = Object.keys(targets);
  const results = await Promise.all(names.map((name) => statsForContainer(docker, targets[name])));

  const stats = {};
  names.forEach((name, index) => {
    if (results[index]) stats[name] = results[index];
  });

  return { stats };
}
