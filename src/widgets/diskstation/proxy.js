import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";
import getServiceWidget from "utils/config/service-helpers";

const logger = createLogger("diskstationProxyHandler");
const authApi = "{url}/webapi/auth.cgi?api=SYNO.API.Auth&version=2&method=login&account={username}&passwd={password}&session=DownloadStation&format=cookie"

async function login(widget) {
  const loginUrl = formatApiCall(authApi, widget);
  const [status, contentType, data] = await httpProxy(loginUrl);
  if (status !== 200) {
    return [status, contentType, data];
  }

  const json = JSON.parse(data.toString());
  if (json?.success !== true) {
    // from https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/DownloadStation/All/enu/Synology_Download_Station_Web_API.pdf
    /*
      Code Description
      400  No such account or incorrect password
      401  Account disabled
      402  Permission denied
      403  2-step verification code required
      404  Failed to authenticate 2-step verification code
    */
    let message = "Authentication failed.";
    if (json?.error?.code >= 403) message += " 2FA enabled.";
    logger.warn("Unable to login.  Code: %d", json?.error?.code);
    return [401, "application/json", JSON.stringify({ code: json?.error?.code, message })];
  }

  return [status, contentType, data];
}

export default async function diskstationProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);
  const api = widgets?.[widget.type]?.api;
  if (!api) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  const url = formatApiCall(api, { endpoint, ...widget });
  let [status, contentType, data] = await httpProxy(url);
  if (status !== 200) {
    logger.debug("Error %d calling endpoint %s", status, url);
    return res.status(status, data);
  }

  const json = JSON.parse(data.toString());
  if (json?.success !== true) {
    logger.debug("Logging in to DiskStation");
    [status, contentType, data] = await login(widget);
    if (status !== 200) {
      return res.status(status).end(data)
    }

    [status, contentType, data] = await httpProxy(url);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
