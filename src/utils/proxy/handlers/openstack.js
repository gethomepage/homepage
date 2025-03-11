import getServiceWidget from "utils/config/service-helpers";
import { httpProxy } from "utils/proxy/http";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import validateWidgetData from "utils/proxy/validate-widget-data";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";
import fetch from "node-fetch";
import NodeCache from "node-cache";
import semver from "semver";
import { resolve } from "url";

const logger = createLogger("openstackProxyHandler");
const cache = new NodeCache();

export default async function openstackProxyHandler(req, res, map) {
    const { group, service, endpoint, index } = req.query;
    const widget = await getServiceWidget(group, service, index);
    const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
    
    let apiVersionSupported;
    try {
        logger.debug("Checking for Compute API version support");
        apiVersionSupported = await isApiVersionSupported(widget)
    } catch(err) {
        logger.warn(err.message);
        return res
            .status(err?.code || 500)
            .json({ error: { 
                message: err.message,
                url: sanitizeErrorURL(err?.details?.url),
                data: err?.details?.data
            }});
    }

    if (!apiVersionSupported) {
        const errMsg = `Compute API version ${widget.version} is not supported`;
        logger.warn(errMsg);
        return res
            .status(500)
            .json({ error: { 
                message: errMsg,
                url: sanitizeErrorURL(url)
            }});
    }
    logger.debug(`Compute API version ${widget.version} is supported`);

    let authToken;
    try {
        logger.debug("Retrieving authentication token");
        authToken = await getAuthToken(widget);
    } catch(err) {
        logger.warn(err.message);
        return res
            .status(err?.code || 500)
            .json({ error: { 
                message: err.message,
                url: sanitizeErrorURL(err?.details?.url),
                data: err?.details?.data
            }});
    }

    const headers = {
        "Content-Type": "application/json",
        "X-Auth-Token": authToken
    };

    const [status, contentType, data] = await httpProxy(url, {
        method: req.method,
        withCredentials: true,
        credentials: "include",
        headers,
    });

    if (data.error?.url) {
        data.error.url = sanitizeErrorURL(url);
    }

    if (status !== 200 || !validateWidgetData(widget, endpoint, data)) {
        const errMsg = `Received invalid response from OpenStack endpoint`;
        logger.warn(errMsg);
        return res
            .status(status)
            .json({ error: { 
                message: errMsg,
                url: sanitizeErrorURL(url),
                data: data
            }});
    }

    if (map) data = map(data);
    if (contentType) res.setHeader("Content-Type", contentType);
    return res.status(status).send(data);
}

async function isApiVersionSupported(widget) {
    const { url, version } = widget;
    const options = {
        headers: {
            "Content-Type": "application/json"
        }
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        const err = new Error("Could not fetch OpenStack API versions");
        err.code = response.status;
        err.details = {
            url: url,
            data: response.json()
        };
        throw err;
    }

    const data = await response.json();
    for (const v of data.versions) {
        const ver = semver.coerce(version);

        if (semver.satisfies(ver, v.min_version + " - " + v.version)) {
            return true;
        }
    }

    return false;
}

async function isIdpVersionSupported(identityUrl) {
    const options = {
        headers: {
            "Content-Type": "application/json"
        }
    };
    
    const response = await fetch(identityUrl, options);
    if (!response.ok && response.status !== 300) {
        const err = new Error("Could not fetch OpenStack IDP versions");
        err.code = response.status;
        err.details = {
            url: identityUrl,
            data: response.json()
        };
        throw err;
    }
    
    const data = await response.json();
    for (const v of data.versions.values) {
        const ver = semver.coerce(v.id);
        const majorVer = semver.major(ver);

        if (majorVer === 3) {
            return true;
        }
    }
}

async function getAuthToken(widget) {
    const { identityUrl, appCredId, appCredName, appCredSecret } = widget;
    const cacheToken = `openstack-token-${appCredId}`

    if (cache.has(cacheToken)) {
        logger.debug("Retrieved authentication token from cache");
        return cache.get(cacheToken);
    }

    logger.debug("Checking for Identity API version support");
    if (!await isIdpVersionSupported(identityUrl)) {
        const err = new Error("Currently only OpenStack IDP major version v3 is supported");
        err.details = { url: identityUrl };
        throw err;
    }

    const data = {
        "auth": {
            "identity": {
                "methods": [
                    "application_credential"
                ],
                "application_credential": {
                    "id": appCredId,
                    "name": appCredName,
                    "secret": appCredSecret
                }
            }
        }
    };

    const options = {
        method: "post",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    };

    const url = resolve(identityUrl, "/v3/auth/tokens");
    const response = await fetch(url, options);
    if (!response.ok) {
        const err = new Error("Could not fetch OpenStack auth token");
        err.code = response.status;
        err.details = {
            url: url,
            data: response.json()
        };
    }

    const token = response.headers.get("X-Subject-Token");
    const { token: { expires_at: expiryDate } } = await response.json();
    const ttlMillis = new Date(expiryDate) - new Date();
    const ttl = Math.floor(ttlMillis / 1000);
    cache.set(cacheToken, token, ttl);

    logger.debug("Retrieved and cached authentication token from Identity API");
    return token;
}
