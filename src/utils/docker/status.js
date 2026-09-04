import Docker from "dockerode";

import getDockerArguments from "utils/config/docker";

function healthFromStatus(status) {
  if (!status) return undefined;
  if (status.includes("(unhealthy)")) return "unhealthy";
  if (status.includes("(healthy)")) return "healthy";
  if (status.includes("(health: starting)")) return "starting";
  return undefined;
}

function statusEntry(state, status) {
  const health = healthFromStatus(status);
  return health ? { status: state, health } : { status: state };
}

export async function getDockerStatuses(server) {
  const dockerArgs = getDockerArguments(server);
  const docker = new Docker(dockerArgs.conn);
  const containers = await docker.listContainers({ all: true });

  if (!Array.isArray(containers)) {
    return { error: "query failed" };
  }

  const statuses = {};
  const byId = {};

  containers.forEach((container) => {
    const info = statusEntry(container.State, container.Status);
    byId[container.Id] = info;
    container.Names.forEach((name) => {
      statuses[name.replace(/^\//, "")] = info;
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
