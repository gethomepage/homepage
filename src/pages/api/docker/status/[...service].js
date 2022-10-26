import Docker from "dockerode";

import getDockerArguments from "utils/config/docker";

export default async function handler(req, res) {
  const { service } = req.query;
  const [containerName, containerServer] = service;

  if (!containerName && !containerServer) {
    return res.status(400).send({
      error: "docker query parameters are required",
    });
  }

  try {
    const docker = new Docker(getDockerArguments(containerServer));
    const containers = await docker.listContainers({
      all: true,
    });

    // bad docker connections can result in a <Buffer ...> object?
    // in any case, this ensures the result is the expected array
    if (!Array.isArray(containers)) {
      return res.status(500).send({
        error: "query failed",
      });
    }

    const containerNames = containers.map((container) => container.Names[0].replace(/^\//, ""));
    const containerExists = containerNames.includes(containerName);

    if (containerExists) {
      const container = docker.getContainer(containerName);
      const info = await container.inspect();

      return res.status(200).json({
        status: info.State.Status,
      });
    }

    const tasks = await docker.listTasks({
      filters: {
        service: [containerName],
        // A service can have several offline containers, we only look for an active one.
        'desired-state': ['running']
      }
    }).catch(() => []);

    // For now we are only interested in the first one (in case replicas > 1).
    // TODO: Show the result for all replicas/containers?
    const taskContainerId = tasks.at(0)?.Status?.ContainerStatus?.ContainerID

    if (taskContainerId) {
      const container = docker.getContainer(taskContainerId);
      const info = await container.inspect();

      return res.status(200).json({
        status: info.State.Status,
      });
    }

    return res.status(200).send({
      error: "not found",
    });
  } catch {
    return res.status(500).send({
      error: "unknown error",
    });
  }
}
