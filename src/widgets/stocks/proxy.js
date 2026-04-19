import { getSettings } from "utils/config/config";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import validateWidgetData from "utils/proxy/validate-widget-data";

const logger = createLogger("stocksProxyHandler");

const FINNHUB_BASE_URL = "https://finnhub.io/api";
const ADANOS_BASE_URL = "https://api.adanos.org";

const ADANOS_STOCK_SOURCES = {
  reddit_stocks: "reddit/stocks/v1",
  x_stocks: "x/stocks/v1",
  news_stocks: "news/stocks/v1",
  polymarket_stocks: "polymarket/stocks/v1",
};

function providerToken(provider) {
  const providers = getSettings()?.providers ?? {};
  return providers?.[provider];
}

function buildUrl(baseUrl, endpoint) {
  return new URL(`${baseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`);
}

function buildAdanosUrl(widget, endpoint) {
  const sourcePath = ADANOS_STOCK_SOURCES[widget.sentimentSource ?? "reddit_stocks"];
  if (!sourcePath) return null;
  return buildUrl(`${ADANOS_BASE_URL}/${sourcePath}`, endpoint);
}

function stockHeaders(widget, endpoint) {
  if (endpoint.startsWith("v1/")) {
    const token = providerToken("finnhub");
    return token ? { "X-Finnhub-Token": `${token}` } : {};
  }

  const token = providerToken("adanos");
  if (!token) return null;
  return { "X-API-Key": `${token}` };
}

function stockUrl(widget, endpoint) {
  if (endpoint.startsWith("v1/")) {
    return buildUrl(FINNHUB_BASE_URL, endpoint);
  }

  return buildAdanosUrl(widget, endpoint);
}

export default async function stocksProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: "Invalid proxy service endpoint" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing stocks widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const url = stockUrl(widget, endpoint);
  if (!url) {
    return res.status(400).json({ error: "Invalid Adanos sentiment source" });
  }

  const headers = stockHeaders(widget, endpoint);
  if (!headers) {
    return res.status(400).json({ error: "Missing or invalid API Key for provider" });
  }

  const [status, contentType, data] = await httpProxy(url, {
    method: req.method,
    withCredentials: true,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  let resultData = data;

  if (resultData.error?.url) {
    resultData.error.url = sanitizeErrorURL(url);
  }

  if (status >= 400) {
    logger.error("HTTP Error %d calling %s", status, url.toString());
  }

  if (status === 200) {
    if (!validateWidgetData(widget, endpoint.split("?")[0], resultData)) {
      return res.status(500).json({ error: { message: "Invalid data", url: sanitizeErrorURL(url), data: resultData } });
    }
    if (map) resultData = map(resultData);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(resultData);
}
