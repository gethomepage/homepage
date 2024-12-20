import { promise as ping } from "ping";

import { getServiceItem } from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("ping");

export default async function handler(req, res) {
  const { groupName, serviceName } = req.query;
  const serviceItem = await getServiceItem(groupName, serviceName);
  if (!serviceItem) {
    logger.debug(`No service item found for group ${groupName} named ${serviceName}`);
    return res.status(400).send({
      error: "Unable to find service, see log for details.",
    });
  }

  const { ping: pingHostOrURL } = serviceItem;

  if (!pingHostOrURL) {
    logger.debug("No ping host specified");
    return res.status(400).send({
      error: "No ping host given",
    });
  }

  let hostname = pingHostOrURL;
  try {
    // maintain backwards compatibility with old ping where may be http://...
    hostname = new URL(pingHostOrURL).hostname;
  } catch (e) {
    // eslint-disable-line no-empty
  }

  try {
    const response = await ping.probe(hostname);
    return res.status(200).json(response);
  } catch (e) {
    logger.debug("Error attempting ping: %s", e);
    return res.status(400).send({
      error: "Error attempting ping, see logs.",
    });
  }
}
