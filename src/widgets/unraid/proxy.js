import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { asJson } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("unraidProxyHandler");

const UNRAID_DEFAULT_FIELDS = ["status", "cpu", "memoryAvailable", "notifications"];
const MAX_ALLOWED_FIELDS = 4;

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

function getBlock(field, data, widget) {
  if (field.startsWith("pool")) {
    const pool = field.match(/^pool[1-4]/)?.[0]; // Match pool1, pool2, etc.
    if (pool) {
      // Get the last part of the field, e.g., "UsedSpace" from "pool1UsedSpace"
      const param = field.replace(pool, "");
      const poolName = widget?.[pool] || pool;
      const label = "unraid.pool" + param;
      const cache = data?.array?.caches?.find((c) => c.name === poolName);

      switch (param) {
        case "UsedSpace":
          return {
            poolName,
            label,
            t: "common.bytes",
            key: field,
            value: cache?.fsUsed != null ? cache.fsUsed * 1000 : "-",
          };
        case "FreeSpace":
          return {
            poolName,
            label,
            key: field,
            t: "common.bytes",
            value: cache?.fsFree != null ? cache.fsFree * 1000 : "-",
          };
        case "UsedPercent":
          return {
            poolName,
            label,
            key: field,
            t: "common.percent",
            value: (cache?.fsUsed / cache?.fsSize) * 100 ?? null,
          };
      }
    }
  }

  switch (field) {
    case "status":
      return { label: "unraid.status", t: data?.array?.state != null ? `unraid.${data.array.state}` : "-", value: "" };
    case "cpu":
      return { label: "unraid.cpu", t: "common.percent", value: data?.metrics?.cpu?.percentTotal ?? null };
    case "memoryPercent":
      return { label: "unraid.memoryPercent", t: "common.percent", value: data?.metrics?.memory?.percentTotal ?? null };
    case "notifications":
      return {
        label: "unraid.notifications",
        t: "common.number",
        value: data?.notifications?.overview?.unread?.total ?? null,
      };
    case "memoryAvailable":
      return { label: "unraid.memoryAvailable", t: "common.bbytes", value: data?.metrics?.memory?.available ?? null };
    case "memoryUsed":
      return { label: "unraid.memoryUsed", t: "common.bbytes", value: data?.metrics?.memory?.active ?? null };
    case "arrayFreeSpace":
      return {
        label: "unraid.arrayFreeSpace",
        t: "common.bytes",
        value: data?.array?.capacity?.kilobytes?.free * 1000 ?? null,
      };
    case "arrayUsedSpace":
      return {
        label: "unraid.arrayUsedSpace",
        t: "common.bytes",
        value: data?.array?.capacity?.kilobytes?.used * 1000 ?? null,
      };
    case "arrayUsedPercent":
      return {
        label: "unraid.arrayUsedPercent",
        t: "common.percent",
        value: (data?.array?.capacity?.kilobytes?.used / data?.array?.capacity?.kilobytes?.total) * 100 ?? null,
      };
  }

  return null;
}

function processUnraidResponse(data, widget) {
  const response = [];

  try {
    data = asJson(data)?.data;

    widget.fields.forEach((field) => {
      const block = getBlock(field, data, widget);
      if (block) {
        response.push(block);
      }
    });
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

  if (!widget.fields?.length > 0) {
    widget.fields = UNRAID_DEFAULT_FIELDS;
  } else if (widget.fields.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
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
    withCredentials: true,
    credentials: "include",
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

  const result = processUnraidResponse(data, widget);
  if (result.error) {
    logger.error("Error processing Unraid data: %s", result.error);
    return res.status(500).send({ error: { message: "Error processing Unraid API response", data: result.error } });
  }

  res.setHeader("Content-Type", "application/json");
  return res.status(status).send(result);
}
