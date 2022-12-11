import Docker from "dockerode";

import getDockerArguments from "utils/config/docker";

export default async function handler(req, res) {
  const { service } = req.query;
  const [containerName, containerServer] = service;

  if (!containerName && !containerServer) {
    res.status(400).send({
      error: "docker query parameters are required",
    });
    return;
  }

  try {
    const dockerArgs = getDockerArguments(containerServer)
    const docker = new Docker(dockerArgs.conn);
    const containers = await docker.listContainers({
      all: true,
    });

    // bad docker connections can result in a <Buffer ...> object?
    // in any case, this ensures the result is the expected array
    if (!Array.isArray(containers)) {
      res.status(500).send({
        error: "query failed",
      });
      return;
    }

    const containerNames = containers.map((container) => container.Names[0].replace(/^\//, ""));
    const containerExists = containerNames.includes(containerName);

    if (containerExists) {
      const container = docker.getContainer(containerName);
      const stats = await container.stats({ stream: false });

      res.status(200).json({
        stats,
      });
      return;
    }

    // Try with a service deployed in Docker Swarm, if enabled
    if (dockerArgs.swarm) {
      const tasks = await docker.listTasks({
          filters: {
            service: [containerName],
            // A service can have several offline containers, so we only look for an active one.
            "desired-state": ["running"],
          },
        })
        .catch(() => []);

      // For now we are only interested in the first one (in case replicas > 1).
      // TODO: Show the result for all replicas/containers?
      const taskContainerId = tasks.at(0)?.Status?.ContainerStatus?.ContainerID;

      if (taskContainerId) {
        const container = docker.getContainer(taskContainerId);
        const stats = await container.stats({ stream: false });

        res.status(200).json({
          stats,
        });
        return;
      }
    }

    res.status(200).send({
      error: "not found",
    });
  } catch {
    res.status(500).send({
      error: {message: "Unknown error"},
    });
  }
}
