import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "guacamoleProxyHandler";
const tokenCacheKey = `${proxyName}__token`;
const dataSourceCacheKey = `${proxyName}__dataSource`;
const logger = createLogger(proxyName);

async function login(widget, service) {
  const loginUrl = `${widget.url.replace(/\/+$/, "")}/api/tokens`;
  const body = new URLSearchParams({ username: widget.username, password: widget.password }).toString();

  const [status, , data] = await httpProxy(loginUrl, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (status !== 200) {
    return [status, null, null, data];
  }

  let parsed;
  try {
    parsed = JSON.parse(Buffer.from(data).toString());
  } catch (e) {
    logger.error("Error parsing Guacamole login response: %s", e);
    return [500, null, null, data];
  }

  const dataSource = widget.datasource || parsed.dataSource;
  cache.put(`${tokenCacheKey}.${service}`, parsed.authToken);
  cache.put(`${dataSourceCacheKey}.${service}`, dataSource);

  return [status, parsed.authToken, dataSource, data];
}

export default async function guacamoleProxyHandler(req, res) {
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

  if (!widgets?.[widget.type]?.api) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  let token = cache.get(`${tokenCacheKey}.${service}`);
  let dataSource = cache.get(`${dataSourceCacheKey}.${service}`);

  if (!token || !dataSource) {
    let status;
    let data;
    [status, token, dataSource, data] = await login(widget, service);
    if (status !== 200) {
      logger.debug(`HTTP ${status} logging into Guacamole api: ${data}`);
      return res.status(status).send(data);
    }
  }

  const buildUrl = () => {
    const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget, datasource: dataSource }));
    url.searchParams.set("token", token);
    return url;
  };

  let [status, contentType, data] = await httpProxy(buildUrl(), { method: "GET" });

  if (status === 401 || status === 403) {
    logger.debug(`HTTP ${status} retrieving data from Guacamole api, logging in and trying again.`);
    cache.del(`${tokenCacheKey}.${service}`);
    cache.del(`${dataSourceCacheKey}.${service}`);

    let loginStatus;
    [loginStatus, token, dataSource, data] = await login(widget, service);

    if (loginStatus !== 200) {
      logger.debug(`HTTP ${loginStatus} logging into Guacamole api: ${data}`);
      return res.status(loginStatus).send(data);
    }

    [status, contentType, data] = await httpProxy(buildUrl(), { method: "GET" });
  }

  if (status !== 200) {
    logger.error("HTTP %d getting data from Guacamole endpoint %s", status, endpoint);
    return res.status(status).send(data);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
