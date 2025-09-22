import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { asJson } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("unraidProxyHandler");

const graphqlQuery = `
{
  array {
    state
    capacity {
      kilobytes {
        free
        total
        used
      }
    }
    caches {
      name
      fsType
      fsSize
      fsFree
      fsUsed
    }
  }
  metrics {
    memory {
      active
      available
      percentTotal
    }
    cpu {
      percentTotal
    }
  }
  notifications {
    overview {
      unread {
        total
      }
    }
  }
}
`;

function processUnraidResponse(data) {
  const response = {};

  try {
    data = asJson(data)?.data;

    response["memoryUsedPercent"] = data?.metrics?.memory?.percentTotal ?? null;
    response["memoryUsed"] = data?.metrics?.memory?.active ?? null;
    response["memoryAvailable"] = data?.metrics?.memory?.available ?? null;
    response["cpuPercent"] = data?.metrics?.cpu?.percentTotal ?? null;
    response["unreadNotifications"] = data?.notifications?.overview?.unread?.total ?? null;
    response["arrayState"] = data?.array?.state ?? null;
    response["arrayFree"] = data?.array?.capacity?.kilobytes?.free * 1000 ?? null;
    response["arrayUsed"] = data?.array?.capacity?.kilobytes?.used * 1000 ?? null;
    response["arrayUsedPercent"] =
      (data?.array?.capacity?.kilobytes?.used / data?.array?.capacity?.kilobytes?.total) * 100 ?? null;

    response["caches"] = {};
    if (data?.array?.caches) {
      data.array.caches.forEach((cache) => {
        if (cache.fsType) {
          response.caches[cache.name] = {
            fsFree: cache.fsFree * 1000,
            fsUsed: cache.fsUsed * 1000,
            fsUsedPercent: (cache.fsUsed / cache.fsSize) * 100 ?? null,
          };
        }
      });
    }
  } catch (error) {
    return { error: error.message };
  }

  return response;
}

export default async function unraidProxyHandler(req, res) {
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

  const url = new URL(widget.url + "/graphql");

  const headers = {
    "Content-Type": "application/json",
    Accept: `application/json`,
    "X-API-Key": `${widget.key}`,
  };

  const params = {
    method: "POST",
    headers,
  };
  params.body = JSON.stringify({
    query: graphqlQuery,
  });

  const [status, , data] = await httpProxy(url, params);

  if (status === 204 || status === 304) {
    return res.status(status).end();
  }

  if (status !== 200) {
    logger.error(
      "Error getting data from Unraid for service '%s' in group '%s': %d.  Data: %s",
      service,
      group,
      status,
      data,
    );
    return res.status(status).send({ error: { message: "Error calling Unraid API.", data } });
  }

  const result = processUnraidResponse(data);
  if (result.error) {
    logger.error("Error processing Unraid data: %s", result.error);
    return res.status(500).json({ error: result.error });
  }

  res.setHeader("Content-Type", "application/json");
  return res.status(status).send(result);
}
