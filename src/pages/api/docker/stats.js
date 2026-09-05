import { getDockerStats } from "utils/docker/stats";
import createLogger from "utils/logger";

const logger = createLogger("dockerStats");

export default async function handler(req, res) {
  try {
    const result = await getDockerStats(req.query.server);

    if (result.error) {
      return res.status(500).send({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (e) {
    if (e) logger.error(e);
    return res.status(500).send({
      error: { message: e?.message ?? "Unknown error" },
    });
  }
}
