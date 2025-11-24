import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
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
      // If there are more than one question marks, replace others to &
      let urlString = formatApiCall(widgets[widget.type].api, { endpoint, ...widget }).replace(/(?<=\?.*)\?/g, "&");
      if (widget.type === "customapi" && widget.url?.endsWith("/")) {
        urlString += "/"; // Ensure we dont lose the trailing slash for custom API calls
      }
      const url = new URL(urlString);
      const loginUrl = `${widget.url}/api/login`;

      let status, contentType, data, responseHeaders;

      const params = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (widget.username || widget.password) setCookieHeader(url, params);
      [status, , data] = await httpProxy(url, params);

      if (data.error?.url) {
        resultData.error.url = sanitizeErrorURL(url);
      }

      if (status === 200) {
        if (!validateWidgetData(widget, endpoint, data)) {
          return res
            .status(status)
            .json({ error: { message: "Invalid data", url: sanitizeErrorURL(url), data: data } });
        }
        if (map) data = map(data);
      }

      if (status == 401) {
        if (widget.username || widget.password)
          [status, contentType, data, responseHeaders] = await tryLogin(
            loginUrl,
            widget.username,
            widget.password,
            service,
          );

        if (status === 200) {
          addCookieToJar(url, responseHeaders);
          setCookieHeader(url, params);
          [status, , data] = await httpProxy(url, params);
        } else if (status === 401) {
          logger.debug(
            "Invalid credentials (HTTP %d) used to log into Frigate on %s//%s%s%s...",
            status,
            url.protocol,
            url.hostname,
            url.port ? `:${url.port}` : "",
            url.pathname,
          );
          return res.status(status).json({
            error: {
              message: `HTTP Error ${status} - Invalid credentials provided`,
              url: sanitizeErrorURL(url),
              data: Buffer.isBuffer(data) ? Buffer.from(data).toString() : data,
            },
          });
        } else {
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
              message: `HTTP Error ${status} while trying to login to Frigate`,
              url: sanitizeErrorURL(url),
              data: Buffer.isBuffer(data) ? Buffer.from(data).toString() : data,
            },
          });
        }
      } else if (status >= 400) {
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

      return res.status(status).send(data);
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
