import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const proxyName = "pangolinProxyHandler";
const orgsCacheKey = `${proxyName}__orgs`;
const logger = createLogger(proxyName);
const emptyStats = { sites: 0, sitesOnline: 0, resources: 0, resourcesHealthy: 0, targets: 0, targetsHealthy: 0 };

async function getWidget(req) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return null;
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return null;
  }

  return widget;
}

async function fetchFromPangolinAPI(endpoint, widget) {
  const url = new URL(`${widget.url}/v1${endpoint}`);

  const [status, , data] = await httpProxy(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${widget.key}`,
    },
  });

  if (status !== 200) {
    logger.error("Error fetching %s: HTTP %d", endpoint, status);
    return [status, null];
  }

  try {
    const parsed = JSON.parse(data.toString());
    return [status, parsed];
  } catch (e) {
    logger.error("JSON parse error for %s", endpoint);
    return [status, null];
  }
}

export default async function pangolinProxyHandler(req, res) {
  const widget = await getWidget(req);
  const { service } = req.query;

  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  let orgIds;
  if (widget.org) {
    orgIds = Array.isArray(widget.org) ? widget.org : [widget.org];
  } else {
    let orgs = cache.get(`${orgsCacheKey}.${service}`);
    if (orgs === null) {
      const [status, orgData] = await fetchFromPangolinAPI("/orgs", widget);

      if (status !== 200 || !orgData?.data?.orgs) {
        return res.status(status).json({
          error: { message: "Error fetching organizations from Pangolin API", data: orgData },
        });
      }

      orgs = orgData.data.orgs;
      cache.put(`${orgsCacheKey}.${service}`, orgs, 1000 * 60 * 10);
    }
    orgIds = orgs.map((o) => o.orgId);
  }

  const orgStats = await Promise.all(
    orgIds.map(async (orgId) => {
      const stats = { ...emptyStats };

      const [sitesStatus, sitesData] = await fetchFromPangolinAPI(`/org/${orgId}/sites`, widget);
      if (sitesStatus === 200 && sitesData?.data?.sites) {
        stats.sites = sitesData.data.sites.length;
        stats.sitesOnline = sitesData.data.sites.filter((site) => site.online).length;
      }

      const [resourcesStatus, resourcesData] = await fetchFromPangolinAPI(`/org/${orgId}/resources`, widget);
      if (resourcesStatus === 200 && resourcesData?.data?.resources) {
        resourcesData.data.resources.forEach((resource) => {
          stats.resources += 1;
          let resourceHasHealthyTarget = false;

          if (resource.targets?.length) {
            resource.targets.forEach((target) => {
              stats.targets += 1;
              if (target.healthStatus !== "unhealthy") {
                stats.targetsHealthy += 1;
                resourceHasHealthyTarget = true;
              }
            });
          }

          if (resourceHasHealthyTarget || !resource.targets?.length) {
            stats.resourcesHealthy += 1;
          }
        });
      }

      return stats;
    }),
  );

  const totals = orgStats.reduce(
    (sum, org) => ({
      sites: sum.sites + org.sites,
      sitesOnline: sum.sitesOnline + org.sitesOnline,
      resources: sum.resources + org.resources,
      resourcesHealthy: sum.resourcesHealthy + org.resourcesHealthy,
      targets: sum.targets + org.targets,
      targetsHealthy: sum.targetsHealthy + org.targetsHealthy,
    }),
    { ...emptyStats },
  );

  return res.status(200).json({
    orgs: orgIds.length,
    sites: totals.sites,
    sitesOnline: totals.sitesOnline,
    resources: totals.resources,
    resourcesHealthy: totals.resourcesHealthy,
    targets: totals.targets,
    targetsHealthy: totals.targetsHealthy,
  });
}
