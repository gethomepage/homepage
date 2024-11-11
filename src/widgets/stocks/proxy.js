import { getSettings } from "utils/config/config";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import validateWidgetData from "utils/proxy/validate-widget-data";
import widgets from "widgets/widgets";

const logger = createLogger("stocksProxyHandler");

export default async function stocksProxyHandler(req, res, map) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      const { providers } = getSettings();

      const headers = {
        "Content-Type": "application/json",
      };
      let baseUrl = "";

      if (widget.provider === "finnhub" && providers?.finnhub) {
        baseUrl = `https://finnhub.io/api/{endpoint}`;
        headers["X-Finnhub-Token"] = `${providers?.finnhub}`;
      } else if (widget.provider === "yahoofinance") {
        baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${endpoint}?period=1d&interval=1d`;
        // Yahoo Finance API tends to block requests without a User-Agent header with a 429 Too Many Requests error
        headers["User-Agent"] =
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";
      }

      const url = new URL(formatApiCall(baseUrl, { endpoint, ...widget }).replace(/(?<=\?.*)\?/g, "&"));
      const [status, contentType, data] = await httpProxy(url, {
        method: req.method,
        withCredentials: true,
        credentials: "include",
        headers,
      });

      let resultData = data;

      if (resultData.error?.url) {
        resultData.error.url = sanitizeErrorURL(url);
      }

      if (status === 204 || status === 304) {
        return res.status(status).end();
      }

      if (status >= 400) {
        logger.error("HTTP Error %d calling %s", status, url.toString());
      }

      if (status === 200) {
        if (!validateWidgetData(widget, endpoint, resultData)) {
          return res
            .status(500)
            .json({ error: { message: "Invalid data", url: sanitizeErrorURL(url), data: resultData } });
        }
        if (map) resultData = map(resultData);
      }

      if (contentType) res.setHeader("Content-Type", contentType);
      return res.status(status).send(resultData);
    }
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
