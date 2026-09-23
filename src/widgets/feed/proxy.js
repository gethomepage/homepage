import { parseFeed } from "./utils";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("feedProxyHandler");

export default async function feedProxyHandler(req, res) {
  const { group, service, index } = req.query;
  const widget = await getServiceWidget(group, service, index);

  if (!widget?.url) {
    return res.status(400).json({ error: "Missing feed URL" });
  }

  let url;
  try {
    url = new URL(widget.url);
  } catch {
    return res.status(400).json({ error: "Invalid feed URL" });
  }

  const [status, , data] = await httpProxy(url, {
    headers: {
      "User-Agent": `gethomepage/${process.env.NEXT_PUBLIC_VERSION || "dev"}`,
      Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.9, */*;q=0.8",
    },
  });

  if (status !== 200) {
    logger.debug("HTTP %d retrieving feed %s//%s%s", status, url.protocol, url.host, url.pathname);
    return res.status(status).json({ error: { message: "HTTP Error", url: sanitizeErrorURL(url) } });
  }

  let items;
  try {
    items = parseFeed(Buffer.from(data).toString(), url.href);
  } catch (e) {
    logger.debug("Error parsing feed %s//%s%s: %s", url.protocol, url.host, url.pathname, e.message);
    return res.status(500).json({ error: { message: "Invalid feed", url: sanitizeErrorURL(url) } });
  }

  const maxItems = parseInt(widget.maxItems, 10) || 5;
  const showImages = widget.images !== false && widget.images !== "false";

  return res.status(200).json({
    items: items.slice(0, maxItems).map(({ image, ...item }) => (showImages && image ? { ...item, image } : item)),
  });
}
