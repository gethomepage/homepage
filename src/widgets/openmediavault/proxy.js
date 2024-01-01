import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import { addCookieToJar, setCookieHeader } from "utils/proxy/cookie-jar";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const PROXY_NAME = "OMVProxyHandler";
const BG_MAX_RETRIES = 50;
const BG_POLL_PERIOD = 500;

const logger = createLogger(PROXY_NAME);

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

async function rpc(url, request) {
  const params = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  };
  setCookieHeader(url, params);
  const [status, contentType, data, headers] = await httpProxy(url, params);

  return { status, contentType, data, headers };
}

async function poll(attemptsLeft, makeReqByPos, pos = 0) {
  if (attemptsLeft <= 0) {
    return null;
  }

  const resp = await makeReqByPos(pos);

  const data = JSON.parse(resp.data.toString()).response;
  if (data.running === true || data.outputPending) {
    await new Promise((resolve) => {
      setTimeout(resolve, BG_POLL_PERIOD);
    });
    return poll(attemptsLeft - 1, makeReqByPos, data.pos);
  }
  return resp;
}

async function tryLogin(widget) {
  const url = new URL(formatApiCall(widgets?.[widget.type]?.api, { ...widget }));
  const { username, password } = widget;
  const resp = await rpc(url, {
    method: "login",
    service: "session",
    params: { username: username.toString(), password: password.toString() },
  });

  if (resp.status !== 200) {
    logger.error("HTTP %d logging in to OpenMediaVault. Data: %s", resp.status, resp.data);
    return [false, resp];
  }

  const json = JSON.parse(resp.data.toString());
  if (json.response.authenticated !== true) {
    logger.error("Login error in OpenMediaVault. Data: %s", resp.data);
    resp.status = 401;
    return [false, resp];
  }

  return [true, resp];
}
async function processBg(url, filename) {
  const resp = await poll(BG_MAX_RETRIES, (pos) =>
    rpc(url, {
      service: "exec",
      method: "getOutput",
      params: { pos, filename },
    }),
  );

  if (resp == null) {
    const errText = "The maximum number of attempts to receive a response from Bg data has been exceeded.";
    logger.error(errText);
    return errText;
  }
  if (resp.status !== 200) {
    logger.error("HTTP %d getting Bg data from OpenMediaVault RPC. Data: %s", resp.status, resp.data);
  }
  return resp;
}

export default async function proxyHandler(req, res) {
  const widget = await getWidget(req);
  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const api = widgets?.[widget.type]?.api;
  if (!api) {
    return res.status(403).json({ error: "Service does not support RPC calls" });
  }

  const url = new URL(formatApiCall(api, { ...widget }));
  const [service, method] = widget.method.split(".");
  const rpcReq = { params: { limit: -1, start: 0 }, service, method };

  let resp = await rpc(url, rpcReq);

  if (resp.status === 401) {
    logger.debug("Session not authenticated.");
    const [success, lResp] = await tryLogin(widget);

    if (success) {
      addCookieToJar(url, lResp.headers);
    } else {
      res.status(lResp.status).json({ error: { message: `HTTP Error ${lResp.status}`, url, data: lResp.data } });
    }

    logger.debug("Retrying OpenMediaVault request after login.");
    resp = await rpc(url, rpcReq);
  }

  if (resp.status !== 200) {
    logger.error("HTTP %d getting data from OpenMediaVault RPC. Data: %s", resp.status, resp.data);
    return res.status(resp.status).json({ error: { message: `HTTP Error ${resp.status}`, url, data: resp.data } });
  }

  if (method.endsWith("Bg")) {
    const json = JSON.parse(resp.data.toString());
    const bgResp = await processBg(url, json.response);

    if (typeof bgResp === "string") {
      return res.status(400).json({ error: bgResp });
    }
    return res.status(bgResp.status).send(bgResp.data);
  }

  return res.status(resp.status).send(resp.data);
}
