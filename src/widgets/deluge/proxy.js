import { formatApiCall } from "utils/proxy/api-helpers";
import { sendJsonRpcRequest } from "utils/proxy/handlers/jsonrpc";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const logger = createLogger("delugeProxyHandler");

const dataMethod = "web.update_ui";
const dataParams = [
  [
    "queue",
    "name",
    "total_wanted",
    "state",
    "progress",
    "download_payload_rate",
    "upload_payload_rate",
    "total_remaining",
    "eta",
  ],
  {},
];
const loginMethod = "auth.login";

async function sendRpc(url, method, params) {
  const [status, contentType, data] = await sendJsonRpcRequest(url, method, params);
  const json = JSON.parse(data.toString());
  if (json?.error) {
    if (json.error.code === 1) {
      return [403, contentType, data];
    }
    return [500, contentType, data];
  }

  return [status, contentType, data];
}

function login(url, password) {
  return sendRpc(url, loginMethod, [password]);
}

export default async function delugeProxyHandler(req, res) {
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

  const api = widgets?.[widget.type]?.api;
  const url = new URL(formatApiCall(api, { ...widget }));

  let [status, contentType, data] = await sendRpc(url, dataMethod, dataParams);
  if (status === 403) {
    [status, contentType, data] = await login(url, widget.password);
    if (status !== 200) {
      return res.status(status).end(data);
    }

    // eslint-disable-next-line no-unused-vars
    [status, contentType, data] = await sendRpc(url, dataMethod, dataParams);
  }

  return res.status(status).end(data);
}
