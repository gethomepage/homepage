import getServiceWidget from "utils/config/service-helpers";
import { httpProxy } from "utils/proxy/http";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import validateWidgetData from "utils/proxy/validate-widget-data";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";
import fetch from "node-fetch";
import NodeCache from "node-cache";
import semver from "semver";

const logger = createLogger("openstackProxyHandler");
const cache = new NodeCache();

export default async function openstackProxyHandler(req, res, map) {
    const { group, service, endpoint, index } = req.query;
    const widget = await getServiceWidget(group, service, index);
    const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
    
    let apiVersionSupported;
    try {
        apiVersionSupported = await isApiVersionSupported(widget)
    } catch(err) {
        return res
            .status(err?.code || 500)
            .json({ error: { 
                message: err.message,
                url: sanitizeErrorURL(err?.details?.url),
                data: err?.details?.data
            }});
    }

    if (!apiVersionSupported) {
        return res
            .status(500)
            .json({ error: { 
                message: `OpenStack API version ${widget.version} is not supported`,
                url: sanitizeErrorURL(url)
            }});
    }

    let authToken;
    try {
        authToken = await getAuthToken(widget)
    } catch(err) {
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

    if (status !== 200) {
        return res
            .status(status)
            .json({ error: { 
                message: `Invalid response status from OpenStack endpoint`,
                url: sanitizeErrorURL(url),
                data: data
            }});
    } else  {
        if (!validateWidgetData(widget, endpoint, data)) {
            return res
                .status(status)
                .json({ error: { 
                    message: `Received invalid data from OpenStack endpoint`,
                    url: sanitizeErrorURL(url),
                    data: data
                }});
        }
        if (map) data = map(data);
    }

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

async function isIdpVersionSupported(idpUrl) {
    const options = {
        headers: {
            "Content-Type": "application/json"
        }
    };

    const response = await fetch(idpUrl, options);
    if (!response.ok && response.status !== 300) {
        const err = new Error("Could not fetch OpenStack IDP versions");
        err.code = response.status;
        err.details = {
            url: url,
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
    const { idpUrl, appCredId, appCredName, appCredSecret } = widget;

    if (cache.has("openstack-token-" + idpUrl)) {
        return cache.get("openstack-token-" + idpUrl);
    }

    if (!await isIdpVersionSupported(idpUrl)) {
        const err = new Error("Currently only OpenStack IDP major version v3 is supported");
        err.code = response.status;
        err.details = {
            url: url,
            data: response.json()
        };
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

    const url = idpUrl + "v3/auth/tokens";
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
    cache.set("openstack-token-" + idpUrl, token, ttl);

    return token;
}
