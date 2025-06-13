import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import validateWidgetData from "utils/proxy/validate-widget-data";
import widgets from "widgets/widgets";

const logger = createLogger("komodoProxyHandler");

export default async function komodoProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);
    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      // api uses unified read endpoint
      const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint: "read", ...widget })).toString();

      const headers = {
        "Content-Type": "application/json",
        "X-API-Key": `${widget.key}`,
        "X-API-Secret": `${widget.secret}`,
      };
      const [status, contentType, data] = await httpProxy(url, {
        method: "POST",
        body: JSON.stringify(widgets[widget.type].mappings?.[endpoint]?.body || {}),
        headers,
      });

      let resultData = data;

      if (status >= 400) {
        logger.error("HTTP Error %d calling %s", status, sanitizeErrorURL(url));
      }

      if (status === 200) {
        if (!validateWidgetData(widget, endpoint, resultData)) {
          return res
            .status(500)
            .json({ error: { message: "Invalid data", url: sanitizeErrorURL(url), data: resultData } });
        }
      }

      if (contentType) res.setHeader("Content-Type", contentType);
      return res.status(status).send(resultData);
    }
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
