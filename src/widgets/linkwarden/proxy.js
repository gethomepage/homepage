import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const proxyName = "linkwardenProxyHandler";
const logger = createLogger(proxyName);

const CONTENT_TYPE_JSON = "application/json";
const AUTHORIZATION = "Authorization";
const BEARER = "Bearer";
const ERROR_INVALID_SERVICE = "Invalid proxy service type";
const ERROR_MISSING_TOKEN = "Missing widget token";

async function retrieveFromAPI(url, token) {
  const headers = {
    "Content-Type": CONTENT_TYPE_JSON,
    [AUTHORIZATION]: `${BEARER} ${token}`,
  };

  const [status, , data] = await httpProxy(url, { headers });

  if (status === 401) {
    const errorResponse = JSON.parse(Buffer.from(data).toString());
    throw new Error(`Unauthorized: ${errorResponse.response}`);
  }

  if (status !== 200) {
    throw new Error(`Error getting data from Linkwarden: ${status}. Data: ${data.toString()}`);
  }

  return JSON.parse(Buffer.from(data).toString());
}

export default async function linkwardenProxyHandler(req, res) {
  const { group, service, endpoint, query } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: ERROR_INVALID_SERVICE });
  }

  const widget = await getServiceWidget(group, service);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: ERROR_INVALID_SERVICE });
  }

  if (!widget.token) {
    logger.debug("Invalid or missing token for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: ERROR_MISSING_TOKEN });
  }

  const apiURL = "{url}/api/v1/{endpoint}";

  try {
    const url = new URL(formatApiCall(apiURL, { endpoint, ...widget }));

    // Parse the query JSON if it exists
    if (query) {
      try {
        const parsedQuery = JSON.parse(query);
        Object.entries(parsedQuery).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      } catch (error) {
        logger.error("Error parsing query JSON:", error);
      }
    }

    logger.info(`Constructed API URL: ${url.toString()}`);

    const data = await retrieveFromAPI(url, widget.token);

    return res.status(200).json(data);
  } catch (e) {
    logger.error(e.message);
    return res.status(500).json({ error: { message: e.message } });
  }
}
