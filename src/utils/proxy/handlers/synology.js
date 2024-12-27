import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import { asJson, formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const INFO_ENDPOINT = "{url}/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query";
const AUTH_ENDPOINT =
  "{url}/webapi/{path}?api=SYNO.API.Auth&version={maxVersion}&method=login&account={username}&passwd={password}&session=DownloadStation&format=cookie";
const AUTH_API_NAME = "SYNO.API.Auth";

const proxyName = "synologyProxyHandler";
const logger = createLogger(proxyName);

async function login(loginUrl) {
  const [status, contentType, data] = await httpProxy(loginUrl);
  if (status !== 200) {
    return [status, contentType, data];
  }

  const json = asJson(data);
  if (json?.success !== true) {
    // from page 16: https://global.download.synology.com/download/Document/Software/DeveloperGuide/Os/DSM/All/enu/DSM_Login_Web_API_Guide_enu.pdf
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

async function getApiInfo(serviceWidget, apiName, serviceName) {
  const cacheKey = `${proxyName}__${apiName}__${serviceName}`;
  let { cgiPath, maxVersion } = cache.get(cacheKey) ?? {};
  if (cgiPath && maxVersion) {
    return [cgiPath, maxVersion];
  }

  const infoUrl = formatApiCall(INFO_ENDPOINT, serviceWidget);
  // eslint-disable-next-line no-unused-vars
  const [status, contentType, data] = await httpProxy(infoUrl);

  if (status === 200) {
    try {
      const json = asJson(data);
      if (json?.data?.[apiName]) {
        cgiPath = json.data[apiName].path;
        maxVersion = json.data[apiName].maxVersion;
        logger.debug(
          `Detected ${serviceWidget.type}: apiName '${apiName}', cgiPath '${cgiPath}', and maxVersion ${maxVersion}`,
        );
        cache.put(cacheKey, { cgiPath, maxVersion });
        return [cgiPath, maxVersion];
      }
    } catch {
      logger.warn(`Error ${status} obtaining ${apiName} info`);
    }
  }

  return [null, null];
}

async function handleUnsuccessfulResponse(serviceWidget, url, serviceName) {
  logger.debug(`Attempting login to ${serviceWidget.type}`);

  // eslint-disable-next-line no-unused-vars
  const [apiPath, maxVersion] = await getApiInfo(serviceWidget, AUTH_API_NAME, serviceName);

  const authArgs = { path: apiPath ?? "entry.cgi", maxVersion: maxVersion ?? 7, ...serviceWidget };
  const loginUrl = formatApiCall(AUTH_ENDPOINT, authArgs);

  const [status, contentType, data] = await login(loginUrl);
  if (status !== 200) {
    return [status, contentType, data];
  }

  return httpProxy(url);
}

function toError(url, synologyError) {
  // commeon codes (100 => 199) from:
  // https://global.download.synology.com/download/Document/Software/DeveloperGuide/Os/DSM/All/enu/DSM_Login_Web_API_Guide_enu.pdf
  const code = synologyError.error?.code ?? synologyError.error ?? synologyError.code ?? 100;
  const error = { code };
  switch (code) {
    case 102:
      error.error = "The requested API does not exist.";
      break;

    case 103:
      error.error = "The requested method does not exist.";
      break;

    case 104:
      error.error = "The requested version does not support the functionality.";
      break;

    case 105:
      error.error = "The logged in session does not have permission.";
      break;

    case 106:
      error.error = "Session timeout.";
      break;

    case 107:
      error.error = "Session interrupted by duplicated login.";
      break;

    case 119:
      error.error = "Invalid session or SID not found.";
      break;

    default:
      error.error = synologyError.message ?? "Unknown error.";
      break;
  }
  logger.warn(`Unable to call ${url}.  code: ${code}, error: ${error.error}.`);
  return error;
}

export default async function synologyProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const serviceWidget = await getServiceWidget(group, service, index);
  const widget = widgets?.[serviceWidget.type];
  const mapping = widget?.mappings?.[endpoint];
  if (!widget.api || !mapping) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  const [cgiPath, maxVersion] = await getApiInfo(serviceWidget, mapping.apiName, service);
  if (!cgiPath || !maxVersion) {
    return res.status(400).json({ error: `Unrecognized API name: ${mapping.apiName}` });
  }

  const url = formatApiCall(widget.api, {
    apiName: mapping.apiName,
    apiMethod: mapping.apiMethod,
    cgiPath,
    maxVersion,
    ...serviceWidget,
  });
  let [status, contentType, data] = await httpProxy(url);
  if (status !== 200) {
    logger.debug("Error %d calling url %s", status, url);
    return res.status(status, data);
  }

  let json = asJson(data);
  if (json?.success !== true) {
    logger.debug(`Attempting login to ${serviceWidget.type}`);
    [status, contentType, data] = await handleUnsuccessfulResponse(serviceWidget, url, service);
    json = asJson(data);
  }

  if (json.success !== true) {
    data = toError(url, json);
    status = 500;
  }
  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
