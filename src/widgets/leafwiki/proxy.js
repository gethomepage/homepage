import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "leafwikiProxyHandler";
const logger = createLogger(proxyName);

async function login(loginUrl, identifier, password) {
  const [status] = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return status;
}

export default async function leafwikiProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget || !widgets?.[widget.type]?.api) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
  const cacheKey = `${proxyName}__authenticated.${service}`;

  if (widget.username && widget.password && !cache.get(cacheKey)) {
    const loginUrl = `${widget.url}/api/auth/login`;
    const loginStatus = await login(loginUrl, widget.username, widget.password);

    if (loginStatus !== 200) {
      logger.error("HTTP %d logging into LeafWiki", loginStatus);
      return res.status(loginStatus).json({ error: "Failed to login to LeafWiki" });
    }

    cache.put(cacheKey, true, 50 * 60 * 1000);
  }

  let [status, contentType, data] = await httpProxy(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (status === 401 && widget.username && widget.password) {
    cache.del(cacheKey);
    const loginUrl = `${widget.url}/api/auth/login`;
    const loginStatus = await login(loginUrl, widget.username, widget.password);

    if (loginStatus !== 200) {
      logger.error("HTTP %d re-logging into LeafWiki", loginStatus);
      return res.status(loginStatus).json({ error: "Failed to re-login to LeafWiki" });
    }

    cache.put(cacheKey, true, 50 * 60 * 1000);
    [status, contentType, data] = await httpProxy(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  }

  if (status !== 200) {
    return res.status(status).send(data);
  }

  let tree;
  try {
    tree = JSON.parse(data.toString());
  } catch (e) {
    logger.error("Failed to parse LeafWiki tree response: %s", e.message);
    return res.status(500).json({ error: "Failed to parse LeafWiki tree response" });
  }

  return res.status(200).json(countNodes(tree));
}

function countNodes(node) {
  let pages = 0;

  function traverse(n) {
    if (!n || typeof n !== "object") return;
    const isRoot = n.id === "root";
    const hasChildren = Array.isArray(n.children);
    if (!isRoot) {
      // Use kind if present, otherwise infer from structure
      if (n.kind === "page" || (!n.kind && !hasChildren)) pages += 1;;
    }
    if (hasChildren) n.children.forEach(traverse);
  }

  traverse(node);
  return { pages };
}
