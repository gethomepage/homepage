import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("uptimeKumaProxyHandler");

async function getStatus(widget) {
  const url = new URL(`${widget.url}/api/status-page/${widget.slug}`).toString();
  logger.debug("get status %s", url);
  const params = { method: "GET", headers: {} };
  const [status, , data] = await httpProxy(url, params);
  try {
    return [status, JSON.parse(data)];
  } catch (e) {
    logger.error("Error decoding status data. Data: %s", data.toString());
    return [status, null];
  }
}

async function getHeartbeat(widget) {
  const url = new URL(`${widget.url}/api/status-page/heartbeat/${widget.slug}`).toString();
  logger.debug("get heartbeat %s", url);
  const params = { method: "GET", headers: {} };
  const [status, , data] = await httpProxy(url, params);
  try {
    return [status, JSON.parse(data)];
  } catch (e) {
    logger.error("Error decoding heartbeat data. Data: %s", data.toString());
    return [status, null];
  }
}

function statusMessage(data) {
  if (!data || Object.keys(data.heartbeatList) === 0) {
    return "unknown";
  }

  let result = "good";
  let hasUp = false;
  Object.values(data.heartbeatList).forEach((el) => {
    const index = el.length - 1;
    if (el[index].status === 1) {
      hasUp = true;
    } else {
      result = "warn";
    }
  });

  if (!hasUp) {
    result = "bad";
  }
  return result;
}

function uptime(data) {
  if (!data) {
    return 0;
  }

  const uptimeList = Object.values(data.uptimeList);
  const percent = uptimeList.reduce((a, b) => a + b, 0) / uptimeList.length || 0;
  return (percent * 100).toFixed(1);
}

export default async function uptimeKumaProxyHandler(req, res) {
  const { group, service } = req.query;
  const widget = await getServiceWidget(group, service);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const [[statusCode, statusData], [heartbeatCode, heartbeatData]] = await Promise.all([
    getStatus(widget),
    getHeartbeat(widget),
  ]);

  if (statusCode !== 200) {
    logger.error("HTTP %d getting status data error. Data: %s", statusCode, statusData);
    return res.status(statusCode).send(statusData);
  }

  if (heartbeatCode !== 200) {
    logger.error("HTTP %d getting heartbeat data error. Data: %s", heartbeatCode, heartbeatData);
    return res.status(heartbeatCode).send(heartbeatData);
  }

  const icon = statusData?.config ? statusData.config.icon : null;
  return res.status(200).send({
    uptime: uptime(heartbeatData),
    message: statusMessage(heartbeatData),
    incident: statusData?.incident ? statusData.incident.title : "",
    icon: `${widget.url}${icon}`,
  });
}
