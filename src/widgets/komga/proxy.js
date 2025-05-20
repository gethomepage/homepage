import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "komgaProxyHandler";
const logger = createLogger(proxyName);

export default async function komgaProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      try {
        const data = {};
        const headers = {
          accept: "application/json",
          "Content-Type": "application/json",
        };
        if (widget.username && widget.password) {
          headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
        } else if (widget.key) {
          headers["X-API-Key"] = widget.key;
        }
        const librariesURL = formatApiCall(widgets?.[widget.type].api, { ...widget, endpoint: "libraries" });
        const [librariesStatus, , librariesData] = await httpProxy(librariesURL, {
          method: "GET",
          headers,
          cookieHeader: "X-Auth-Token",
        });

        if (librariesStatus !== 200) {
          return res.status(librariesStatus).send(data);
        }

        data.libraries = JSON.parse(Buffer.from(librariesData).toString()).filter((library) => !library.unavailable);

        const seriesEndpointName = widget.version === 2 ? "seriesv2" : "series";
        const seriesEndpoint = widgets[widget.type].mappings[seriesEndpointName].endpoint;
        const seriesURL = formatApiCall(widgets?.[widget.type].api, { ...widget, endpoint: seriesEndpoint });
        const [seriesStatus, , seriesData] = await httpProxy(seriesURL, {
          method: widgets[widget.type].mappings[seriesEndpointName].method || "GET",
          headers,
          body: "{}",
          cookieHeader: "X-Auth-Token",
        });

        if (seriesStatus !== 200) {
          return res.status(seriesStatus).send(data);
        }

        data.series = JSON.parse(Buffer.from(seriesData).toString());

        const booksEndpointName = widget.version === 2 ? "booksv2" : "books";
        const booksEndpoint = widgets[widget.type].mappings[booksEndpointName].endpoint;
        const booksURL = formatApiCall(widgets?.[widget.type].api, { ...widget, endpoint: booksEndpoint });
        const [booksStatus, , booksData] = await httpProxy(booksURL, {
          method: widgets[widget.type].mappings[booksEndpointName].method || "GET",
          headers,
          body: "{}",
          cookieHeader: "X-Auth-Token",
        });

        if (booksStatus !== 200) {
          return res.status(booksStatus).send(data);
        }

        data.books = JSON.parse(Buffer.from(booksData).toString());

        return res.send(data);
      } catch (e) {
        logger.error("Error communicating with Komga API: %s", e);
        return res.status(500).json({ error: "Error communicating with Komga API" });
      }
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
