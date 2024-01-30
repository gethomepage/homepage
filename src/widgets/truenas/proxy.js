import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import genericProxyHandler from "utils/proxy/handlers/generic";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const logger = createLogger("truenasProxyHandler");

export default async function truenasProxyHandler(req, res, map) {
  const { group, service } = req.query;

  if (group && service) {
    const widgetOpts = await getServiceWidget(group, service);
    let handler;
    if (widgetOpts.username && widgetOpts.password) {
      handler = genericProxyHandler;
    } else if (widgetOpts.key) {
      handler = credentialedProxyHandler;
    }

    if (handler) {
      return handler(req, res, map);
    }

    logger.error("Error getting data from Truenas: Username / password or API key required");
    return res.status(500).json({ error: "Username / password or API key required" });
  }

  return res.status(500).json({ error: "Error parsing widget request" });
}
