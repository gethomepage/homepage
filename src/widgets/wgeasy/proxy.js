import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";
import createLogger from "utils/logger";

const proxyName = "wgeasyProxyHandler";
const logger = createLogger(proxyName);
const sessionSIDCacheKey = `${proxyName}__sessionSID`;

async function login(widget, service) {
  const url = formatApiCall(widgets[widget.type].api, { ...widget, endpoint: "session" });
  // eslint-disable-next-line no-unused-vars
  const [status, contenType, data, responseHeaders] = await httpProxy(url, {
    method: "POST",
    body: JSON.stringify({ password: widget.password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  let connectSidCookie;

  try {
    connectSidCookie = responseHeaders["set-cookie"]
      .find((cookie) => cookie.startsWith("connect.sid="))
      .split(";")[0]
      .replace("connect.sid=", "");
    cache.put(`${sessionSIDCacheKey}.${service}`);
  } catch (e) {
    logger.error(`Error logging into wg-easy`);
    cache.del(`${sessionSIDCacheKey}.${service}`);
  }
  return [status, connectSidCookie ?? null];
}

export default async function wgeasyProxyHandler(req, res) {
  const { group, service } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      let sid = cache.get(`${sessionSIDCacheKey}.${service}`);
      if (!sid) {
        sid = await login(widget, service);
        if (!sid) {
          return res.status(500).json({ error: "Failed to authenticate with Wg-Easy" });
        }
      }
      // eslint-disable-next-line no-unused-vars
      const [status, contentType, data, responseHeaders] = await httpProxy(
        formatApiCall(widgets[widget.type].api, { ...widget, endpoint: "wireguard/client" }),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: `connect.sid=${sid}`,
          },
        },
      );

      const dataParsed = JSON.parse(data);
      if (widget.threshold) {
        dataParsed.push({ threshold: widget.threshold });
      } else {
        dataParsed.push({ threshold: 2 });
      }

      return res.send(dataParsed);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
