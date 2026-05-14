import Docker from "dockerode";

import getDockerArguments from "utils/config/docker";
import createLogger from "utils/logger";

const logger = createLogger("dockerRestartContainer");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.query;

  if (!name || name.length === 0) {
    return res.status(400).json({ error: "Container name is required" });
  }

  const containerName = name[0];
  const containerServer = name[1];

  try {
    const dockerArgs = getDockerArguments(containerServer);
    const docker = new Docker(dockerArgs.conn);

    const containers = await docker.listContainers({ all: true });
    const containerNames = containers.flatMap((c) => c.Names.map((n) => n.replace(/^\//, "")));

    if (!containerNames.includes(containerName)) {
      return res.status(404).json({ error: "Container not found" });
    }

    const container = docker.getContainer(containerName);
    await container.restart();

    logger.info(`Container ${containerName} restarted successfully`);
    return res.status(200).json({ success: true, container: containerName });
  } catch (e) {
    logger.error(e);
    return res.status(500).json({ error: e?.message ?? "Failed to restart container" });
  }
}