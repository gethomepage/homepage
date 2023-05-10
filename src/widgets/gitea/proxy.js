import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "giteaProxyHandler";
const logger = createLogger(proxyName);

async function apiCall(widget, endpoint) {
  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
  const params = { method: "GET", headers: { Authorization: `token ${widget.token}` } };

  const [status, contentType, data, responseHeaders] = await httpProxy(url, params);

  if (status !== 200) {
    logger.error("Error getting data from Gitea: %s status %d. Data: %s", url, status, data);
    return { status, contentType, data: null, responseHeaders };
  }

  return { status, contentType, data: JSON.parse(data.toString()), responseHeaders };
}

export default async function giteaProxyHandler(req, res) {
  const { group, service } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const { responseHeaders: reposHeaders } = await apiCall(widget, "repos/search");
  const { responseHeaders: usersHeaders } = await apiCall(widget, "admin/users");
  const { responseHeaders: orgsHeaders } = await apiCall(widget, "admin/orgs");

  return res.status(200).send({
    repos: reposHeaders["x-total-count"],
    users: usersHeaders["x-total-count"],
    orgs: orgsHeaders["x-total-count"],
  });
}
