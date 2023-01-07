
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import getServiceWidget from "utils/config/service-helpers";

const proxyName = "synologyProxyHandler";

const logger = createLogger(proxyName);


function formatUptime(uptime) {
  const [hour, minutes, seconds] = uptime.split(":");
  const days = Math.floor(hour/24);
  const hours = hour % 24;

  return `${days} d ${hours}h${minutes}m${seconds}s`
}

async function getApiInfo(api, widget) {
  const infoAPI = "{url}/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query"

  const infoUrl = formatApiCall(infoAPI, widget);
  // eslint-disable-next-line no-unused-vars
  const [status, contentType, data] = await httpProxy(infoUrl);

  if (status === 200) {
    const json = JSON.parse(data.toString());
    if (json.data[api]) {
      const { path, minVersion, maxVersion } = json.data[api];
      return [ path, minVersion, maxVersion ];
    }
  }
  return [null, null, null];
}

async function login(widget) {
  // eslint-disable-next-line no-unused-vars
  const [path, minVersion, maxVersion] = await getApiInfo("SYNO.API.Auth", widget);
  const authApi = `{url}/webapi/${path}?api=SYNO.API.Auth&version=${maxVersion}&method=login&account={username}&passwd={password}&format=cookie`
  const loginUrl = formatApiCall(authApi, widget);
  const [status, contentType, data] = await httpProxy(loginUrl);
  if (status !== 200) {
    return [status, contentType, data];
  }

  const json = JSON.parse(data.toString());

  if (json?.success !== true) {
    let message = "Authentication failed.";
    if (json?.error?.code >= 403) message += " 2FA enabled.";
    logger.warn("Unable to login.  Code: %d", json?.error?.code);
    return [401, "application/json", JSON.stringify({ code: json?.error?.code, message })];
  }

  return [status, contentType, data];
}

export default async function synologyProxyHandler(req, res) {
  const { group, service } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);
  // eslint-disable-next-line no-unused-vars
  let [status, contentType, data] = await login(widget);

  const { sid }=JSON.parse(data.toString()).data;
  let api = "SYNO.Core.System";
  // eslint-disable-next-line no-unused-vars
  let [ path, minVersion, maxVersion] = await getApiInfo(api, widget);

  const storageUrl = `${widget.url}/webapi/${path}?api=${api}&version=${maxVersion}&method=info&type="storage"&_sid=${sid}`;

  [status, contentType, data] = await httpProxy(storageUrl );


  let usedVolume = 0;
  if (status !== 200) {
    return res.status(status).set("Content-Type", contentType).send(data);
  }
  let json=JSON.parse(data.toString());
  if (json?.success !== true) {
    return res.status(401).json({ error: "Error getting volume stats" });
  }
  usedVolume = 100 * parseFloat(json.data.vol_info[0].used_size) / parseFloat(json.data.vol_info[0].total_size);

  const healthUrl = `${widget.url}/webapi/${path}?api=${api}&version=${maxVersion}&method=info&_sid=${sid}`;
  [status, contentType, data] = await httpProxy(healthUrl);

  if (status !== 200) {
    return res.status(status).set("Content-Type", contentType).send(data);
  }
  json=JSON.parse(data.toString());
  if (json?.success !== true) {
    return res.status(401).json({ error: "Error getting uptime" });
  }
  const uptime = formatUptime(json.data.up_time);
  api = "SYNO.Core.System.Utilization";
  // eslint-disable-next-line no-unused-vars
  [ path, minVersion, maxVersion] = await getApiInfo(api, widget);
  const sysUrl = `${widget.url}/webapi/${path}?api=${api}&version=${maxVersion}&method=get&_sid=${sid}`;
  [status, contentType, data] = await httpProxy(sysUrl );

  const memoryUsage = 100 - (100 * (parseFloat(JSON.parse(data.toString()).data.memory.avail_real) + parseFloat(JSON.parse(data.toString()).data.memory.cached)) / parseFloat(JSON.parse(data.toString()).data.memory.total_real));
  const cpuLoad = parseFloat(JSON.parse(data.toString()).data.cpu.user_load) + parseFloat(JSON.parse(data.toString()).data.cpu.system_load);



  const resdata = {
    uptime,
    usedVolume,
    memoryUsage,
    cpuLoad,
  }
  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(JSON.stringify(resdata));
}
