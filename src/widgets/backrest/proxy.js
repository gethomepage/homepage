import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { asJson, formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "backrestProxyHandler";
const headerCacheKey = `${proxyName}__headers`;
const logger = createLogger(proxyName);

function buildResponse(data) {
  const plans = data.planSummaries;
  const numPlans = plans.length;

  var numSuccessLatest = 0;
  var numFailureLatest = 0;

  // Number of successful runs in the last 30 days
  const numSuccess30Days = plans
    .map((plan) => {
      const num = Number(plan.backupsSuccessLast30days);
      if (Number.isNaN(num)) return 0;
      return num;
    })
    .reduce((a, b) => a + b, 0);

  // Number of failed runs in the last 30 days
  const numFailure30Days = plans
    .map((plan) => {
      const num = Number(plan.backupsFailed30days);
      if (Number.isNaN(num)) return 0;
      return num;
    })
    .reduce((a, b) => a + b, 0);

  // Total bytes added in the last 30 days
  const bytesAdded30Days = plans
    .map((plan) => {
      const num = Number(plan.bytesAddedLast30days);
      if (Number.isNaN(num)) return 0;
      return num;
    })
    .reduce((a, b) => a + b, 0);

  // For each plan in data.planSummaries, look at recentBackups. recentBackups has two lists: timestampMs and status.
  // Get the index of the latest timestampMs, and check the corresponding status.  If status is "STATUS_SUCCESS", increment numSuccessLatest, otherwise increment numFailureLatest.
  plans.forEach((plan) => {
    const recentBackups = plan.recentBackups;
    if (recentBackups && recentBackups.status) {
      const statuses = recentBackups.status;
      if (statuses.length > 0) {
        const latestStatus = statuses[0]; // Statuses is sorted by most recent first
        if (latestStatus === "STATUS_SUCCESS") {
          numSuccessLatest++;
        } else {
          numFailureLatest++;
        }
      }
    }
  });

  return {
    numPlans,
    numSuccess30Days,
    numFailure30Days,
    numSuccessLatest,
    numFailureLatest,
    bytesAdded30Days,
  };
}

export default async function backrestProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  let headers = cache.get(`${headerCacheKey}.${service}`);
  if (!headers) {
    headers = {
      "content-type": "application/json",
      Authorization: `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`,
    };
    cache.put(`${headerCacheKey}.${service}`, headers);
  }

  const { api } = widgets[widget.type];

  const url = new URL(formatApiCall(api, { endpoint: undefined, ...widget }));
  const method = "POST";
  const body = JSON.stringify({});

  try {
    const [status, contentType, data] = await httpProxy(url, {
      method,
      body,
      headers,
    });

    if (status !== 200) {
      logger.error("Error getting data from Backrest: %d.  Data: %s", status, data);
      return res.status(500).send({ error: { message: "Error getting data from Backrest", url, data } });
    }

    if (contentType) res.setHeader("Content-Type", "application/json");

    const response = buildResponse(asJson(data));
    return res.status(status).send(response);
  } catch (error) {
    logger.error("Exception calling Backrest API: %s", error.message);
    return res.status(500).json({ error: "Backrest API Error", message: error.message });
  }
}
