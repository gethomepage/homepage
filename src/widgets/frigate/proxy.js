import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { asJson, formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { addCookieToJar } from "utils/proxy/cookie-jar";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "frigateProxyHandler";
const logger = createLogger(proxyName);

export default async function frigateProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
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
        const loginUrl = `${widget.url}/api/login`;
        logger.debug("Attempting login to Frigate at %s", loginUrl);
        const [loginStatus, , , loginResponseHeaders] = await httpProxy(loginUrl, {
          method: "POST",
          body: JSON.stringify({ user: widget.username, password: widget.password }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (loginStatus !== 200) {
          logger.error("HTTP Error %d calling %s", loginStatus, sanitizeErrorURL(loginUrl));
          return res.status(status).json({
            error: {
              message: `HTTP Error ${status} while trying to login to Frigate`,
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
            message: `HTTP Error ${status} from Frigate`,
            url: sanitizeErrorURL(url),
          },
        });
      }

      data = asJson(data);

      if (endpoint == "stats") {
        res.status(status).send({
          num_cameras: data?.cameras !== undefined ? Object.keys(data?.cameras).length : 0,
          uptime: data?.service?.uptime,
          version: data?.service.version,
        });
      } else if (endpoint == "events") {
        return res.status(status).send(
          data.slice(0, 5).map((event) => ({
            id: event.id,
            camera: event.camera,
            label: event.label,
            start_time: new Date(event.start_time * 1000),
            thumbnail: event.thumbnail,
            score: event.data.score,
            type: event.data.type,
          })),
        );
      }
    }
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
