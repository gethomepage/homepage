import Docker from "dockerode";

import getDockerArguments from "utils/docker";

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
    const docker = new Docker(getDockerArguments(containerServer));
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

    if (!containerExists) {
      res.status(200).send({
        error: "not found",
      });
      return;
    }

    const container = docker.getContainer(containerName);
    const stats = await container.stats({ stream: false });

    res.status(200).json({
      stats,
    });
  } catch {
    res.status(500).send({
      error: "unknown error",
    });
  }
}
