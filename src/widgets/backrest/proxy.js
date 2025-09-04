import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { asJson, formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "backrestProxyHandler";
const logger = createLogger(proxyName);

function sumField(plans, field) {
  return plans.reduce((sum, plan) => {
    const num = Number(plan[field]);
    return sum + (Number.isNaN(num) ? 0 : num);
  }, 0);
}

function buildResponse(plans) {
  const numSuccess30Days = sumField(plans, "backupsSuccessLast30days");
  const numFailure30Days = sumField(plans, "backupsFailed30days");
  const bytesAdded30Days = sumField(plans, "bytesAddedLast30days");

  var numSuccessLatest = 0;
  var numFailureLatest = 0;

  plans.forEach((plan) => {
    const statuses = plan?.recentBackups?.status;
    if (Array.isArray(statuses) && statuses.length > 0) {
      if (statuses[0] === "STATUS_SUCCESS") {
        numSuccessLatest++;
      } else {
        numFailureLatest++;
      }
    }
  });

  return {
    numPlans: plans.length,
    numSuccess30Days,
    numFailure30Days,
    numSuccessLatest,
    numFailureLatest,
    bytesAdded30Days,
  };
}

export default async function backrestProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const headers = {
    "content-type": "application/json",
  };

  if (widget.username && widget.password) {
    headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
  }

  const { api } = widgets[widget.type];
  const url = new URL(formatApiCall(api, { endpoint, ...widget }));

  try {
    const [status, contentType, data] = await httpProxy(url, {
      method: "POST",
      body: JSON.stringify({}),
      headers,
    });

    if (status !== 200) {
      logger.error("Error getting data from Backrest: %d.  Data: %s", status, data);
      return res.status(500).send({ error: { message: "Error getting data from Backrest", url, data } });
    }

    if (contentType) res.setHeader("Content-Type", "application/json");
    const plans = asJson(data).planSummaries;
    if (!Array.isArray(plans)) {
      logger.error("Invalid plans data: %s", JSON.stringify(plans));
      return res.status(500).send({ error: { message: "Invalid plans data", url, data } });
    }
    const response = buildResponse(plans);
    return res.status(status).send(response);
  } catch (error) {
    logger.error("Exception calling Backrest API: %s", error.message);
    return res.status(500).json({ error: "Backrest API Error", message: error.message });
  }
}
