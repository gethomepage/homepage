import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "audiobookshelfProxyHandler";
const logger = createLogger(proxyName);

async function retrieveFromAPI(url, key) {
  const headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  const [status, , data] = await httpProxy(url, { headers });

  if (status !== 200) {
    throw new Error(`Error getting data from Audiobookshelf: ${status}. Data: ${data.toString()}`);
  }

  return JSON.parse(Buffer.from(data).toString());
}

export default async function audiobookshelfProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  if (!widget.key) {
    logger.debug("Invalid or missing key for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Missing widget key" });
  }

  const apiURL = widgets[widget.type].api;

  try {
    const url = new URL(formatApiCall(apiURL, { endpoint, ...widget }));
    const libraryData = await retrieveFromAPI(url, widget.key);

    const libraryStats = await Promise.all(
      libraryData.libraries.map(async (l) => {
        const stats = await retrieveFromAPI(
          new URL(formatApiCall(apiURL, { endpoint: `libraries/${l.id}/stats`, ...widget })),
          widget.key,
        );
        return {
          ...l,
          stats,
        };
      }),
    );

    return res.status(200).send(libraryStats);
  } catch (e) {
    if (e) logger.error(e);
    return res.status(500).send({ error: { message: e.message } });
  }
}
