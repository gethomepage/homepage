import { getDockerStatuses } from "utils/docker/status";
import createLogger from "utils/logger";

const logger = createLogger("dockerStatuses");

export default async function handler(req, res) {
  try {
    const result = await getDockerStatuses(req.query.server);

    if (result.error) {
      return res.status(500).send({ error: result.error });
    }

    return res.status(200).json(result.statuses);
  } catch (e) {
    if (e) logger.error(e);
    return res.status(500).send({
      error: { message: e?.message ?? "Unknown error" },
    });
  }
}
