import { createHash } from "crypto";

import cache from "memory-cache";

import { httpProxy } from "utils/proxy/http";

const pendingRequests = new Map();
const tokenErrors = new Set([-44112, -44113]);

class OpenApiError extends Error {
  constructor(message, status = 502, code) {
    super(message);
    this.status = status >= 400 && status < 600 ? status : 502;
    this.code = code;
  }
}

async function request(url, message, options = {}) {
  const [status, , data] = await httpProxy(url, options);
  let response;
  try {
    response = typeof data === "string" || Buffer.isBuffer(data) ? JSON.parse(data.toString()) : data;
  } catch {
    throw new OpenApiError(`${message}: invalid JSON response (HTTP ${status})`, status);
  }

  if (status !== 200 || response?.errorCode !== 0 || response.result == null) {
    const code = Number.isInteger(response?.errorCode) ? response.errorCode : undefined;
    // Return the stage and error code, never raw authentication responses or tokens.
    throw new OpenApiError(
      `${message} (HTTP ${status}${code === undefined ? "" : `, Omada error ${code}`})`,
      status,
      code,
    );
  }
  return response.result;
}

async function authenticate(widget, tokenCacheId) {
  let controllerId = widget.omadacId;
  if (!controllerId) {
    const info = await request(`${widget.url}/api/info`, "Error getting Omada controller info");
    controllerId = info.omadacId;
  }
  if (typeof controllerId !== "string" || !controllerId) {
    throw new OpenApiError("Omada controller ID is missing; configure omadacId from the Open API application");
  }

  const result = await request(
    `${widget.url}/openapi/authorize/token?grant_type=client_credentials`,
    "Error authenticating with Omada Open API; check clientId and clientSecret",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        omadacId: controllerId,
        client_id: widget.clientId,
        client_secret: widget.clientSecret,
      }),
    },
  );
  if (
    typeof result.accessToken !== "string" ||
    !result.accessToken ||
    !Number.isFinite(result.expiresIn) ||
    result.expiresIn <= 0
  ) {
    throw new OpenApiError("Omada Open API returned an invalid access token response");
  }

  const session = { token: result.accessToken, controllerId };
  // Client credentials can obtain a new token without using a refresh token.
  const lifetime = Math.max(1, (result.expiresIn - Math.min(60, result.expiresIn / 2)) * 1000);
  cache.put(tokenCacheId, session, lifetime);
  return session;
}

function getAuthorized(url, session, message) {
  return request(url, message, {
    headers: { Authorization: `AccessToken=${session.token}` },
  });
}

async function findSite(root, widget, session) {
  for (let page = 1; page <= 100; page += 1) {
    const sites = await getAuthorized(
      `${root}/sites?page=${page}&pageSize=100`,
      session,
      "Error getting Omada Open API sites",
    );
    if (!Array.isArray(sites.data) || !Number.isSafeInteger(sites.totalRows) || sites.totalRows < 0) {
      throw new OpenApiError("Omada Open API returned an invalid site list");
    }
    const site = sites.data.find((entry) => entry.name === widget.site);
    if (typeof site?.siteId === "string" && site.siteId) return site.siteId;
    if (sites.data.length === 0 || page * 100 >= sites.totalRows) break;
  }
  throw new OpenApiError("Configured Omada site was not found or is not permitted for this Open API application");
}

function count(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new OpenApiError(`Omada Open API returned an invalid ${name} count`);
  }
  return value;
}

async function getStats(widget, tokenCacheId) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const session = cache.get(tokenCacheId) || (await authenticate(widget, tokenCacheId));
      const root = `${widget.url}/openapi/v1/${encodeURIComponent(session.controllerId)}`;
      if (!session.siteId) session.siteId = await findSite(root, widget, session);
      const siteUrl = `${root}/sites/${encodeURIComponent(session.siteId)}`;
      // Omada 6.3 requires both time filters in milliseconds. Include all retained unresolved alerts.
      const query = new URLSearchParams({
        page: "1",
        pageSize: "10",
        "filters.timeStart": "0",
        "filters.timeEnd": Date.now().toString(),
        "filters.resolved": "false",
      });
      const [overview, alerts] = await Promise.all([
        getAuthorized(`${siteUrl}/dashboard/overview-diagram`, session, "Error getting Omada Open API overview"),
        getAuthorized(`${siteUrl}/logs/alerts?${query}`, session, "Error getting Omada Open API alerts"),
      ]);
      return {
        connectedAp: count(overview.connectedApNum, "AP"),
        activeUser: count(overview.totalClientNum, "client"),
        alerts: count(alerts.totalRows, "unresolved alert"),
        connectedGateways: count(overview.connectedGatewayNum, "gateway"),
        connectedSwitches: count(overview.connectedSwitchNum, "switch"),
      };
    } catch (error) {
      if (attempt === 0 && (error.status === 401 || tokenErrors.has(error.code))) {
        cache.del(tokenCacheId);
        continue;
      }
      throw error;
    }
  }
}

export default async function omadaOpenApiProxyHandler(configuredWidget, res) {
  if (
    ![configuredWidget.url, configuredWidget.clientId, configuredWidget.clientSecret, configuredWidget.site].every(
      (value) => typeof value === "string" && value.trim().length > 0,
    )
  ) {
    return res.status(400).json({ error: { message: "Omada Open API requires url, clientId, clientSecret and site" } });
  }

  const widget = { ...configuredWidget, url: configuredWidget.url.replace(/\/+$/, "") };
  // Scope cached tokens to credentials and controller/site configuration, including credential rotation.
  const cacheId = createHash("sha256")
    .update(JSON.stringify([widget.url, widget.clientId, widget.clientSecret, widget.omadacId, widget.site]))
    .digest("hex");
  const tokenCacheId = `omadaOpenApi__token.${cacheId}`;
  const statsCacheId = `omadaOpenApi__stats.${cacheId}`;

  try {
    const cached = cache.get(statsCacheId);
    if (cached) return res.send(JSON.stringify(cached));

    // Multiple browser tabs share both token acquisition and a poll's API requests.
    if (!pendingRequests.has(cacheId)) {
      pendingRequests.set(
        cacheId,
        getStats(widget, tokenCacheId)
          .then((stats) => {
            cache.put(statsCacheId, stats, 5000);
            return stats;
          })
          .finally(() => pendingRequests.delete(cacheId)),
      );
    }
    const stats = await pendingRequests.get(cacheId);
    return res.send(JSON.stringify(stats));
  } catch (error) {
    return res.status(error instanceof OpenApiError ? error.status : 502).json({
      error: { message: error instanceof OpenApiError ? error.message : "Error calling Omada Open API" },
    });
  }
}
