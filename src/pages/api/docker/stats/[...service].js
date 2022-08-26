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
    const docker = new Docker(await getDockerArguments(containerServer));
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

    const containerNames = containers.map((container) => {
      return container.Names[0].replace(/^\//, "");
    });
    const containerExists = containerNames.includes(containerName);

    if (!containerExists) {
      return res.status(200).send({
        error: "not found",
      });
    }

    const container = docker.getContainer(containerName);
    const stats = await container.stats({ stream: false });

    return res.status(200).json({
      stats: stats,
    });
  } catch {
    return res.status(500).send({
      error: "unknown error",
    });
  }
}
