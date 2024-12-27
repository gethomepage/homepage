import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import validateWidgetData from "utils/proxy/validate-widget-data";
import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const logger = createLogger("genericProxyHandler");

export default async function genericProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      // if there are more than one question marks, replace others to &
      const url = new URL(
        formatApiCall(widgets[widget.type].api, { endpoint, ...widget }).replace(/(?<=\?.*)\?/g, "&"),
      );

      const headers = req.extraHeaders ?? widget.headers ?? widgets[widget.type].headers ?? {};

      if (widget.username && widget.password) {
        headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
      }

      const params = {
        method: widget.method ?? req.method,
        headers,
      };
      if (req.body) {
        params.body = req.body;
      } else if (widget.requestBody) {
        if (typeof widget.requestBody === "object") {
          params.body = JSON.stringify(widget.requestBody);
        } else {
          params.body = widget.requestBody;
        }
      }

      const [status, contentType, data] = await httpProxy(url, params);

      let resultData = data;

      if (resultData.error?.url) {
        resultData.error.url = sanitizeErrorURL(url);
      }

      if (status === 200) {
        if (!validateWidgetData(widget, endpoint, resultData)) {
          return res
            .status(status)
            .json({ error: { message: "Invalid data", url: sanitizeErrorURL(url), data: resultData } });
        }
        if (map) resultData = map(resultData);
      }

      if (contentType) res.setHeader("Content-Type", contentType);

      if (status === 204 || status === 304) {
        return res.status(status).end();
      }

      if (status >= 400) {
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
            message: "HTTP Error",
            url: sanitizeErrorURL(url),
            resultData: Buffer.isBuffer(resultData) ? Buffer.from(resultData).toString() : resultData,
          },
        });
      }

      return res.status(status).send(resultData);
    }
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
