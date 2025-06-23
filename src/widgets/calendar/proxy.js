import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("calendarProxyHandler");

export default async function calendarProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);
    const integration = widget.integrations?.find((i) => i.name === endpoint);

    if (integration) {
      if (!integration.url) {
        return res.status(403).json({ error: "No integration URL specified" });
      }

      const options = {};
      if (integration.url?.includes("outlook")) {
        // Outlook requires a user agent header
        options.headers = {
          "User-Agent": `gethomepage/${process.env.NEXT_PUBLIC_VERSION || "dev"}`,
        };
      }
      const [status, contentType, data] = await httpProxy(integration.url, options);

      if (contentType) res.setHeader("Content-Type", contentType);

      if (status !== 200) {
        logger.debug(`HTTP ${status} retrieving data from integration URL ${integration.url} : ${data}`);
        return res.status(status).send(data);
      }

      return res.status(status).json({ data: data.toString() });
    }
  }

  return res.status(400).json({ error: "Invalid integration" });
}
