import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { asJson, formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { addCookieToJar } from "utils/proxy/cookie-jar";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "dockhandProxyHandler";
const logger = createLogger(proxyName);

export default async function dockhandProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (!widget.env) {
      return res.status(403).json({ error: "Dockhand needs `env` id" });
    }

    if (widget) {
      const url = formatApiCall(widgets[widget.type].api, { endpoint, ...widget });

      const params = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      let [status, , data] = await httpProxy(url, params);

      if (status === 401 && widget.username && widget.password) {
        const loginUrl = `${widget.url}/api/auth/login`;
        logger.debug("Attempting login to Dockhand at %s", loginUrl);
        const [loginStatus, , , loginResponseHeaders] = await httpProxy(loginUrl, {
          method: "POST",
          body: JSON.stringify({ username: widget.username, password: widget.password }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (loginStatus !== 200) {
          logger.error("HTTP Error %d calling %s", loginStatus, sanitizeErrorURL(loginUrl));
          return res.status(status).json({
            error: {
              message: `HTTP Error ${status} while trying to login to Dockhand`,
              url: sanitizeErrorURL(url),
            },
          });
        }

        addCookieToJar(url, loginResponseHeaders);
        // Retry original request with cookie set
        [status, , data] = await httpProxy(url, params);
      }

      if (status >= 400) {
        logger.error("HTTP Error %d calling %s", status, sanitizeErrorURL(url));
        return res.status(status).json({
          error: {
            message: `HTTP Error ${status} from Dockhand`,
            url: sanitizeErrorURL(url),
          },
        });
      }

      data = asJson(data);

      return res.status(status).send(data);
    }
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
