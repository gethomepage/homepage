import Docker from "dockerode";

import getDockerArguments from "utils/config/docker";
import createLogger from "utils/logger";

const logger = createLogger("dockerStatusService");

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

    const containerNames = containers.map((container) => container.Names[0].replace(/^\//, ""));
    const containerExists = containerNames.includes(containerName);

    if (containerExists) {
      const container = docker.getContainer(containerName);
      const info = await container.inspect();

      return res.status(200).json({
        status: info.State.Status,
        health: info.State.Health?.Status,
      });
    }

    if (dockerArgs.swarm) {
      const tasks = await docker.listTasks({
          filters: {
            service: [containerName],
            // A service can have several offline containers, we only look for an active one.
            "desired-state": ["running"],
          },
        })
        .catch(() => []);

      // TODO: Show the result for all replicas/containers?
      // We can only get stats for 'local' containers so try to find one
      const localContainerIDs = containers.map(c => c.Id);
      const task = tasks.find(t => localContainerIDs.includes(t.Status?.ContainerStatus?.ContainerID)) ?? tasks.at(0);
      const taskContainerId = task?.Status?.ContainerStatus?.ContainerID;
      
      if (taskContainerId) {
        try {
          const container = docker.getContainer(taskContainerId);
          const info = await container.inspect();
  
          return res.status(200).json({
            status: info.State.Status,
            health: info.State.Health?.Status,
          });
        } catch (e) {
          if (task) {
            return res.status(200).json({
              status: task.Status.State
            })
          }
        }
      }
    }

    return res.status(200).send({
      error: "not found",
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({
      error: {message: e?.message ?? "Unknown error"},
    });
  }
}
