import {status, statusBedrock} from "minecraft-server-util-dist";

import createLogger from "utils/logger";
import getServiceWidget from "utils/config/service-helpers";

const proxyName = "minecraftProxyHandler";
const logger = createLogger(proxyName);

export default async function minecraftProxyHandler(req, res) {
  const { group, service } = req.query;
  const serviceWidget = await getServiceWidget(group, service);
  const url = new URL(serviceWidget.url);
  const edition = serviceWidget.edition || "java";

  try {
    let svrResponse;
    if (edition.toLowerCase() === "java") {
      svrResponse = await status(url.hostname, Number(url.port));
    } else if (edition.toLowerCase() === "bedrock") {
      svrResponse = await statusBedrock(url.hostname, Number(url.port));
    }
    res.status(200).send({
      version: svrResponse.version.name,
      online: true,
      players: svrResponse.players,
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