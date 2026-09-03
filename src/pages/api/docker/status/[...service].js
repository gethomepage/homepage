import { getDockerStatuses } from "utils/docker/status";
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
    const result = await getDockerStatuses(containerServer);

    if (result.error) {
      return res.status(500).send({ error: result.error });
    }

    const info = result.statuses[containerName];
    if (!info) {
      return res.status(404).send({ status: "not found" });
    }

    return res.status(200).json(info);
  } catch (e) {
    if (e) logger.error(e);
    return res.status(500).send({
      error: { message: e?.message ?? "Unknown error" },
    });
  }
}
