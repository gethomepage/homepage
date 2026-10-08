import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { asJson, formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "giteaProxyHandler";
const logger = createLogger(proxyName);

function countItems(data, responseHeaders) {
  const totalCount = parseInt(responseHeaders?.["x-total-count"], 10);
  if (!Number.isNaN(totalCount)) return totalCount;

  // fallback when the header is missing, e.g. stripped by a reverse proxy
  let json;
  try {
    json = asJson(data);
  } catch (e) {
    logger.debug("Unable to parse Gitea response: %s", e);
    return 0;
  }
  if (Array.isArray(json)) return json.length;
  if (Array.isArray(json?.data)) return json.data.length;
  return 0;
}

export default async function giteaProxyHandler(req, res) {
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

  // the endpoint has its own query string, so replace any further question marks with &
  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }).replace(/(?<=\?.*)\?/g, "&"));

  const [status, , data, responseHeaders] = await httpProxy(url, {
    method: "GET",
    headers: widget.headers ?? {},
  });

  if (status !== 200) {
    logger.debug("HTTP Error %d calling %s//%s%s...", status, url.protocol, url.host, url.pathname);
    return res.status(status).json({
      error: {
        message: "HTTP Error",
        url: sanitizeErrorURL(url),
        data: Buffer.isBuffer(data) ? Buffer.from(data).toString() : data,
      },
    });
  }

  return res.status(200).json({ count: countItems(data, responseHeaders) });
}
