import createLogger from "utils/logger";
import Docker from "dockerode";
import getDockerArguments from "utils/config/docker";

const logger = createLogger("dockerContainerAction");

export default async function handler(req, res) {
  const { action } = req.query;
  const [actionType, containerName, server] = action;

  if (!containerName) {
    return res.status(400).send({
      error: "Container name is required",
    });
  }

  try {
    const dockerArgs = getDockerArguments(server);
    const docker = new Docker(dockerArgs.conn);
    const container = docker.getContainer(containerName);

    switch (req.method) {
      case "POST":
        switch (actionType) {
          case "stop":
            await container.stop();
            break;
          case "start":
            await container.start();
            break;
          case "restart":
            await container.restart();
            break;
          default:
            return res.status(400).send({
              error: "Invalid action",
            });
        }
        return res.status(200).json({ success: true });
      default:
        return res.status(405).send({
          error: "Method not allowed",
        });
    }
  } catch (e) {
    logger.error(e);
    return res.status(500).send({
      error: e.message || "Unknown error",
    });
  }
}
