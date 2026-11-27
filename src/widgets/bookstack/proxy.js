import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const logger = createLogger("bookstackProxyHandler");
const LIST_ENDPOINTS = ["shelves", "books", "chapters", "pages"];

function widgetBaseUrl(widget) {
  return String(widget.url ?? "").replace(/\/+$/, "");
}

function authHeader(widget) {
  return `Token ${widget.tokenId}:${widget.tokenSecret}`;
}

async function fetchTotal(baseUrl, resource, widget) {
  const url = `${baseUrl}/api/${resource}?count=1`;
  const [status, , data] = await httpProxy(url, {
    method: "GET",
    headers: {
      Authorization: authHeader(widget),
      Accept: "application/json",
    },
  });

  if (status !== 200) {
    const body = Buffer.isBuffer(data) ? data.toString() : data;
    logger.debug(`HTTP ${status} retrieving BookStack ${resource}: ${body}`);
    return { ok: false, status, data };
  }

  try {
    const parsed = JSON.parse(Buffer.isBuffer(data) ? data.toString() : data);
    if (typeof parsed?.total !== "number") {
      return { ok: false, status: 500, data: `BookStack ${resource} response did not include a numeric total` };
    }
    return { ok: true, total: parsed.total };
  } catch (error) {
    logger.debug("Failed to parse BookStack %s response: %s", resource, error);
    return { ok: false, status: 500, data: `Failed to parse BookStack ${resource} response` };
  }
}

export default async function bookstackProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      if (!widget.tokenId || !widget.tokenSecret) {
        return res.status(400).json({ error: "Missing BookStack tokenId or tokenSecret" });
      }

      const baseUrl = widgetBaseUrl(widget);
      const results = await Promise.all(LIST_ENDPOINTS.map((resource) => fetchTotal(baseUrl, resource, widget)));
      const failed = results.find((result) => !result.ok);
      if (failed) {
        return res.status(failed.status).send(failed.data);
      }

      const stats = Object.fromEntries(LIST_ENDPOINTS.map((resource, i) => [resource, results[i].total]));
      return res.send(stats);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
