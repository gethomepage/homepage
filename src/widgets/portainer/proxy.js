/* eslint-disable no-underscore-dangle */
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "portainerProxyHandler";

const logger = createLogger(proxyName);

async function getWidget(req) {
  const { group, service } = req.query;
  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return null;
  }
  const widget = await getServiceWidget(group, service);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return null;
  }
  return widget;
}

async function getAllEnvIds(widget) {
  const api = widgets?.[widget.type]?.api;
  if (!api) {
    return [403, null];
  }
  const endpoint = "endpoints";
  let url = new URL(formatApiCall(api, { endpoint, ...widget }));
  let [status, contentType, data] = await httpProxy(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": widget.key,
    },
  });

  if (status !== 200) {
    logger.error("HTTP %d communicating with NextPVR. Data: %s", status, data.toString());
    return [status, data];
  }
  let dataAsJson;
  try {
    const dataDecoded = data.toString();
    dataAsJson = JSON.parse(dataDecoded);
  } catch (e) {
    logger.error("Error decoding NextPVR API data. Data: %s", data.toString());
    return [status, null];
  }
  const ids = await dataAsJson.map((item) => item.Id);

  return ids;
}

async function getAllContainers(ids, widget) {
  let items = [];
  const api = widgets?.[widget.type]?.api;
  if (!api) {
    return [403, null];
  }
  for (let i = 0; i < ids.length; i++) {
    const endpoint = "endpoints/" + ids[i] + "/docker/containers/json?all=1";
    let url = new URL(formatApiCall(api, { endpoint, ...widget }));
    let [status, contentType, data] = await httpProxy(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": widget.key,
      },
    });

    if (status !== 200) {
      logger.error("HTTP %d communicating with NextPVR. Data: %s", status, data.toString());
      return [status, data];
    }
    let dataAsJson;
    try {
      const dataDecoded = data.toString();
      dataAsJson = JSON.parse(dataDecoded);
      items.push(dataAsJson);
    } catch (e) {
      logger.error("Error decoding NextPVR API data. Data: %s", data.toString());
      return [status, null];
    }
  }
  return items.flat();
}

export default async function portainerProxyHandler(req, res) {
  try {
    const widget = await getWidget(req);
    let ids;

    if ("env" in widget) {
      ids = [widget.env];
    } else {
      ids = await getAllEnvIds(widget);
    }
    const data = await getAllContainers(ids, widget);

    const containerList = Object.values(data);

    const running = containerList.filter((c) => c.State === "running").length;
    const stopped = containerList.filter((c) => c.State === "exited").length;
    const total = containerList.length;

    return res.status(200).send({ running, stopped, total });
  } catch (error) {
    console.error("portainerProxyHandler error:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}
