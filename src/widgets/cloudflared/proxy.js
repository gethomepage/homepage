import { httpProxy } from "utils/proxy/http";
import { asJson } from "utils/proxy/api-helpers";
import createLogger from "utils/logger";
import getServiceWidget from "utils/config/service-helpers";

const logger = createLogger("cloudflaredProxyHandler");

export default async function cloudflaredProxyHandler(req, res) {
  const { group, service, index } = req.query;
  const serviceWidget = await getServiceWidget(group, service, index);

  if (!serviceWidget) {
    logger.error("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid widget configuration" });
  }

  const { accountid, tunnelid, key } = serviceWidget;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  if (tunnelid) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountid}/cfd_tunnel/${tunnelid}`;
    const [status, , data] = await httpProxy(url, { headers });

    if (status !== 200) {
      logger.error("HTTP Error %d calling %s", status, url);
      return res.status(status).end(data);
    }

    const json = asJson(data);
    const result = json?.result ?? {};
    const tunnelStatus = result.status ?? "unknown";
    const originIp = result.connections?.origin_ip ?? result.connections?.[0]?.origin_ip ?? null;

    return res.status(200).json({
      mode: "single",
      status: tunnelStatus,
      origin_ip: originIp,
    });
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountid}/cfd_tunnel?is_deleted=false`;
  const [status, , data] = await httpProxy(url, { headers });

  if (status !== 200) {
    logger.error("HTTP Error %d calling %s", status, url);
    return res.status(status).end(data);
  }

  const json = asJson(data);
  const tunnels = json?.result ?? [];
  const healthy = tunnels.filter((t) => t.status === "healthy").length;

  return res.status(200).json({
    mode: "aggregate",
    healthy,
    unhealthy: tunnels.length - healthy,
    total: tunnels.length,
  });
}
