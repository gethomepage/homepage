import Docker from "dockerode";

import getDockerArguments from "utils/config/docker";
import createLogger from "utils/logger";

const logger = createLogger("dockerStatsService");

export default async function handler(req, res) {
  const { service } = req.query;
  const [containerName, containerServer] = service;

  if (!containerName && !containerServer) {
    return res.status(400).send({
      error: "docker query parameters are required",
    });
  }

  try {
    const dockerArgs = getDockerArguments(containerServer);
    const docker = new Docker(dockerArgs.conn);
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

    const containerNames = containers.flatMap((container) => container.Names.map((name) => name.replace(/^\//, "")));
    const containerExists = containerNames.includes(containerName);

    if (containerExists) {
      const container = docker.getContainer(containerName);
      const stats = await container.stats({ stream: false });

      return res.status(200).json({
        stats,
      });
    }

    // Try with a service deployed in Docker Swarm, if enabled
    if (dockerArgs.swarm) {
      const tasks = await docker
        .listTasks({
          filters: {
            service: [containerName],
            // A service can have several offline containers, so we only look for an active one.
            "desired-state": ["running"],
          },
        })
        .catch(() => []);

      // TODO: Show the result for all replicas/containers?
      // We can only get stats for 'local' containers so try to find one
      const localContainerIDs = containers.map((c) => c.Id);
      const task = tasks.find((t) => localContainerIDs.includes(t.Status?.ContainerStatus?.ContainerID)) ?? tasks.at(0);
      const taskContainerId = task?.Status?.ContainerStatus?.ContainerID;

      if (taskContainerId) {
        try {
          const container = docker.getContainer(taskContainerId);
          const stats = await container.stats({ stream: false });

          return res.status(200).json({
            stats,
          });
        } catch (e) {
          return res.status(200).json({
            error: "Unable to retrieve stats",
          });
        }
      }
    }

    return res.status(404).send({
      error: "not found",
    });
  } catch (e) {
    if (e) logger.error(e);
    return res.status(500).send({
      error: { message: e?.message ?? "Unknown error" },
    });
  }
}
