import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { asJson, formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { addCookieToJar, setCookieHeader } from "utils/proxy/cookie-jar";
import { httpProxy } from "utils/proxy/http";
import validateWidgetData from "utils/proxy/validate-widget-data";
import widgets from "widgets/widgets";

const proxyName = "frigateProxyHandler";
const logger = createLogger(proxyName);

export default async function frigateProxyHandler(req, res, map) {
  const { group, service, endpoint, index, url } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      const url = formatApiCall(widgets[widget.type].api, { endpoint, ...widget });

      let status, contentType, data, responseHeaders;

      const params = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (widget.username || widget.password) setCookieHeader(url, params);
      [status, , data] = await httpProxy(url, params);

      if (status === 401 && (widget.username || widget.password)) {
        const loginUrl = `${widget.url}/api/login`;
        let [loginStatus, , , loginResponseHeaders] = await tryLogin(
          loginUrl,
          widget.username,
          widget.password,
          service,
        );

        if (loginStatus !== 200) {
          logger.debug(
            "HTTP Error %d calling %s//%s%s%s...",
            loginStatus,
            loginUrl.protocol,
            loginUrl.hostname,
            loginUrl.port ? `:${loginUrl.port}` : "",
            loginUrl.pathname,
          );
          return res.status(status).json({
            error: {
              message: `HTTP Error ${status} while trying to login to Frigate`,
              url: sanitizeErrorURL(url),
              data: Buffer.isBuffer(data) ? Buffer.from(data).toString() : data,
            },
          });
        }

        addCookieToJar(url, responseHeaders);
        setCookieHeader(url, params);
        [status, , data] = await httpProxy(url, params);
      }

      if (status >= 402) {
        logger.debug(
          "HTTP Error %d calling %s//%s%s%s...",
          status,
          url.protocol,
          url.hostname,
          url.port ? `:${url.port}` : "",
          url.pathname,
        );
        return res.status(status).json({
          error: {
            message: `HTTP Error ${status} from Frigate`,
            url: sanitizeErrorURL(url),
            data: Buffer.isBuffer(data) ? Buffer.from(data).toString() : data,
          },
        });
      }

      if (!validateWidgetData(widget, endpoint, data)) {
        return res.status(status).json({ error: { message: "Invalid data", url: sanitizeErrorURL(url), data: data } });
      }

      data = asJson(data);

      if (endpoint == "stats") {
        res.status(status).send({
          num_cameras: data?.cameras !== undefined ? Object.keys(data?.cameras).length : 0,
          uptime: data?.service?.uptime,
          version: data?.service.version,
        });
      }

      if (endpoint == "events") {
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

async function tryLogin(loginUrl, username, password, service) {
  const [status, contentType, data, responseHeaders] = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify({ user: username, password: password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return [status, contentType, data, responseHeaders];
}
