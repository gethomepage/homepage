import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "forgejoCommitsProxyHandler";
const logger = createLogger(proxyName);

function getCacheKey(service) {
  return `${proxyName}__${service}`;
}

export default async function forgejoCommitsProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget || !widgets?.[widget.type]?.api) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  const cacheKey = getCacheKey(service);
  const cacheDuration = widget["commit-cache"] !== undefined
    ? Math.max(0, parseInt(widget["commit-cache"], 10))
    : 5;

  if (cacheDuration > 0) {
    const cached = cache.get(cacheKey);
    if (cached !== null) {
      return res.json(cached);
    }
  }

  const baseUrl = widget.url.replace(/\/+$/, "");
  const apiBase = `${baseUrl}/api/v1`;

  try {
    const allRepos = [];
    const perPage = 50;
    const shouldPaginate = widget.pagination === true || widget.pagination === "true";

    const searchParams = new URLSearchParams();
    searchParams.set("limit", perPage.toString());

    if (widget.key) {
      searchParams.set("access_token", widget.key);
    }

    let page = 1;

    while (true) {
      const pageParams = new URLSearchParams(searchParams);
      pageParams.set("page", page.toString());

      const url = `${apiBase}/repos/search?${pageParams.toString()}`;

      const [status, , data, responseHeaders] = await httpProxy(url, { method: "GET" });

      if (status !== 200) {
        logger.error("Error fetching repositories from %s: HTTP %d", url, status);
        return res.status(status).json({ error: "Failed to fetch repositories" });
      }

      let json;
      try {
        json = JSON.parse(data.toString());
      } catch (e) {
        logger.error("Failed to parse repositories response: %s", e);
        return res.status(500).json({ error: "Invalid response from repository search" });
      }

      if (!json.data || !Array.isArray(json.data)) {
        break;
      }

      allRepos.push(...json.data);

      if (!shouldPaginate) break;

      const total = parseInt(responseHeaders?.["x-total-count"] || "0", 10);
      if (page * perPage >= total) break;

      page += 1;
    }

    // Sum commits across each repository using the default branch
    let totalCommits = 0;

    for (const repo of allRepos) {
      const fullName = repo.full_name || "";
      const [owner, repoName] = fullName.split("/");
      const branch = repo.default_branch || "main";

      if (!owner || !repoName) continue;

      const commitsParams = new URLSearchParams();
      commitsParams.set("sha", branch);
      commitsParams.set("limit", "1");

      if (widget.key) {
        commitsParams.set("access_token", widget.key);
      }

      const commitsUrl = `${apiBase}/repos/${owner}/${repoName}/commits?${commitsParams.toString()}`;

      const [cStatus, , , cHeaders] = await httpProxy(commitsUrl, { method: "GET" });

      if (cStatus === 200) {
        const count = parseInt(cHeaders?.["x-total-count"] || "0", 10);
        totalCommits += count;
      } else {
        logger.debug("Skipping commits for %s/%s: HTTP %d", owner, repoName, cStatus);
      }
    }

    const result = { total_commits: totalCommits };

    if (cacheDuration > 0) {
      cache.put(cacheKey, result, cacheDuration * 60 * 1000);
    }

    return res.json(result);
  } catch (e) {
    logger.error("Unexpected error in forgejo commits proxy: %s", e);
    return res.status(500).json({ error: "Unexpected error fetching commits" });
  }
}
