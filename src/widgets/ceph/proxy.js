import cache from "memory-cache";

import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const proxyName = "cephProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);

async function login(widget) {  
  
  const loginUrl = new URL(formatApiCall("{url}/api/auth", widget));

  const [status, , data] = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify({ username: widget.username, password: widget.password }),
    headers: {
      "accept": "application/vnd.ceph.api.v1.0+json",
      "Content-Type": "application/json",
    },
  });

  // try to avoid parsing errors that are not from ceph
  if (status >= 500)
  {
    logger.error("Failed to connect to %s, status: %d, detail: %s", loginUrl, status, data?.error?.message ?? "-- Unable to read error message from request");   
    return [status, false ];  
  }
  const dataParsed = JSON.parse(data);

  if (!(status === 201) || !dataParsed.token) {
    logger.error("Failed to login to Ceph, status: %d, detail: %s", status, dataParsed?.detail);    
    return [status, false ];
  }

  return [ status, dataParsed.token ];
}

export default async function cephProxyHandler(req, res) {
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

    if (!widget.url) {
        return res.status(500).json({ error: { message: "Service widget url not configured" } });
    }

    let token = cache.get(`${sessionTokenCacheKey}.${service}`);

    const url = new URL(formatApiCall("{url}/api/health/full", widget));
    const params = {
        method: "GET",
            headers: {
                "accept": "application/vnd.ceph.api.v1.0+json",
                "Authorization": `Bearer ${token}`
            } 
        };
  
    let [status, , data] = await httpProxy(url, params);

    if (status === 401) {
        [status, token] = await login(widget);
        
        if (status !== 201) {
            logger.error("HTTP %d logging in to ceph", status);
            return res.status(status).end(data);
        }

        cache.put(`${sessionTokenCacheKey}.${service}`, token);
        params.headers.Authorization = `Bearer ${token}`;
        [status, , data] = await httpProxy(url, params);
    }

    if (status !== 200) {
        logger.error("HTTP %d getting data from ceph.  Data: %s", status, data);
    }

    return res.status(status).send(data);
}
