import Docker from "dockerode";

import { getSettings } from "utils/config/config";
import getDockerArguments from "utils/config/docker";
import { containersFromConfig, hasHomepageLabels } from "utils/config/service-helpers";

const HEALTH_STATES = ["healthy", "unhealthy", "starting"];

function statusEntry(state, health) {
  return health ? { status: state, health } : { status: state };
}

// docker exposes health only as a filter on the list endpoint, never as a field
async function healthByContainerId(docker) {
  const results = await Promise.all(
    HEALTH_STATES.map((state) => docker.listContainers({ all: true, filters: { health: [state] } }).catch(() => [])),
  );

  const health = {};
  results.forEach((containers, index) => {
    if (!Array.isArray(containers)) return;
    containers.forEach((container) => {
      health[container.Id] = HEALTH_STATES[index];
    });
  });

  return health;
}

export async function getDockerStatuses(server) {
  const dockerArgs = getDockerArguments(server);
  const docker = new Docker(dockerArgs.conn);

  const [containers, health, configured] = await Promise.all([
    docker.listContainers({ all: true }),
    healthByContainerId(docker),
    containersFromConfig(server),
  ]);

  if (!Array.isArray(containers)) {
    return { error: "query failed" };
  }

  const { instanceName } = getSettings();
  const statuses = {};
  const byId = {};

  containers.forEach((container) => {
    const info = statusEntry(container.State, health[container.Id]);
    // keyed by id for every container so swarm tasks can resolve their local container
    byId[container.Id] = info;

    const labelled = hasHomepageLabels(container.Labels, instanceName);
    container.Names.forEach((name) => {
      const containerName = name.replace(/^\//, "");
      if (labelled || configured.has(containerName)) statuses[containerName] = info;
    });
  });

  if (!dockerArgs.swarm) {
    return { statuses };
  }

  const [services, tasks] = await Promise.all([
    docker.listServices().catch(() => []),
    docker.listTasks({ filters: { "desired-state": ["running"] } }).catch(() => []),
  ]);

  const localIds = new Set(containers.map((container) => container.Id));
  const tasksByService = {};
  tasks.forEach((task) => {
    (tasksByService[task.ServiceID] ??= []).push(task);
  });

  services.forEach((service) => {
    const name = service.Spec?.Name;
    if (!name || statuses[name]) return;
    if (!configured.has(name) && !hasHomepageLabels(service.Spec?.Labels, instanceName)) return;

    const serviceTasks = tasksByService[service.ID] ?? [];

    if (service.Spec.Mode?.Replicated) {
      const replicas = parseInt(service.Spec.Mode.Replicated.Replicas, 10);
      if (serviceTasks.length === replicas) {
        statuses[name] = { status: `running ${serviceTasks.length}/${replicas}` };
      } else if (serviceTasks.length > 0) {
        statuses[name] = { status: `partial ${serviceTasks.length}/${replicas}` };
      }
      return;
    }

    const task =
      serviceTasks.find((candidate) => localIds.has(candidate.Status?.ContainerStatus?.ContainerID)) ??
      serviceTasks.at(0);
    const containerId = task?.Status?.ContainerStatus?.ContainerID;
    if (containerId && byId[containerId]) {
      statuses[name] = byId[containerId];
    } else if (task) {
      statuses[name] = { status: task.Status.State };
    }
  });

  return { statuses };
}
