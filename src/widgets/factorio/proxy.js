import { Rcon } from "rcon-client";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const proxyName = "factorioProxyHandler";
const logger = createLogger(proxyName);

const STATUS_COMMAND =
  "/silent-command rcon.print(helpers.table_to_json({tick=game.tick, players=#game.connected_players}))";

export default async function factorioProxyHandler(req, res) {
  const { group, service, index } = req.query;
  const widget = await getServiceWidget(group, service, index);

  const url = new URL(widget.url);
  let rcon;

  try {
    rcon = await Rcon.connect({
      host: url.hostname,
      port: Number(url.port),
      password: widget['rcon-password']
    });

    const response = await rcon.send(STATUS_COMMAND);
    console.log(response)
    const data = JSON.parse(response);

    return res.status(200).send({
      online: true,
      tick: data.tick,
      players: data.players,
    });
  } catch (e) {
    logger.error(e);
    return res.status(200).send({ online: false });
  } finally {
    if (rcon) rcon.end();
  }
}
