import { GameDig } from "gamedig";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const logger = createLogger("satisfactoryProxyHandler");

export default async function satisfactoryProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);
  const api = widgets?.[widget.type]?.api;

  if (!api) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  const url = formatApiCall(api, { ...widget });
  const method = "POST";
  const payload = { function: "QueryServerState" };
  const headers = {
    Authorization: `Bearer ${widget.key}`,
    "Content-Type": "application/json",
  };

  try {
    const [status, contentType, responseData] = await httpProxy(url, {
      method,
      body: JSON.stringify(payload),
      headers,
    });

    const data = JSON.parse(responseData.toString("utf8")).data.serverGameState;

    // GameDig fetch
    const serverUrl = new URL(widget.url);
    let gamedigData = { online: false, name: null, ping: null };

    try {
      const gd = await GameDig.query({
        type: "satisfactory",
        host: serverUrl.hostname,
        port: Number(serverUrl.port),
        givenPortOnly: true,
        checkOldIDs: true,
      });

      gamedigData = {
        online: true,
        name: gd.name,
        ping: gd.ping,
      };
    } catch (e) {
      logger.debug("GameDig query failed: %s", e.message);
    }

    if (contentType) res.setHeader("Content-Type", contentType);
    return res.status(status).send({
      ...data,
      serverName: gamedigData.name,
      online: gamedigData.online,
      ping: gamedigData.ping,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", details: err });
  }
}
