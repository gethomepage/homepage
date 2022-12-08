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

    if (!containerExists) {
      return res.status(200).send({
        error: "not found",
      });
    }

    const container = docker.getContainer(containerName);
    const info = await container.inspect();

    return res.status(200).json({
      status: info.State.Status,
      health: info.State.Health?.Status
    });
  } catch {
    return res.status(500).send({
      error: "unknown error",
    });
  }
}
