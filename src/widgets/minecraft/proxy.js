import mc from "minecraftstatuspinger";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const proxyName = "minecraftProxyHandler";
const logger = createLogger(proxyName);

export default async function minecraftProxyHandler(req, res) {
  const { group, service, index } = req.query;
  const serviceWidget = await getServiceWidget(group, service, index);
  const url = new URL(serviceWidget.url);
  try {
    const pingResponse = await mc.lookup({
      host: url.hostname,
      port: url.port || 25565,
    });
    res.status(200).send({
      version: pingResponse.status.version.name,
      online: true,
      players: pingResponse.status.players,
    });
  } catch (e) {
    if (e) logger.error(e);
    res.status(200).send({
      version: undefined,
      online: false,
      players: undefined,
    });
  }
}
