import { cachedRequest } from "utils/proxy/http";
import createLogger from "utils/logger";

const logger = createLogger("releases");

export default async function handler(req, res) {
  const releasesURL = "https://api.github.com/repos/gethomepage/homepage/releases";
  try {
    return res.send(await cachedRequest(releasesURL, 5));
  } catch (e) {
    logger.error(`Error checking GitHub releases: ${e}`);
    return res.send([]);
  }
}
