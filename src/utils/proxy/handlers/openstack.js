import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import validateWidgetData from "utils/proxy/validate-widget-data";
import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";
import fetch from 'node-fetch';
import NodeCache from "node-cache";

const logger = createLogger("openstackProxyHandler");
const cache = new NodeCache();

export default async function openstackProxyHandler(req, res, map) {
    const { group, service, endpoint, index } = req.query;
    const widget = await getServiceWidget(group, service, index);

    if (!widget || widget.type !== 'openstack') {
        return res.status(400).json({ error: 'openstackProxyHandler can only be used with widget type \'openstack\'' });
    }

    const authToken = await getAuthToken(widget);
    
    const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

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
        console.log(status);
    } else  {
        if (!validateWidgetData(widget, endpoint, data)) {
        return res
            .status(500)
            .json({ error: { message: "Invalid data", url: sanitizeErrorURL(url), data: data } });
        }
        if (map) data = map(data);
    }

    if (contentType) res.setHeader("Content-Type", contentType);
    return res.status(status).send(data);
}

async function getAuthToken(widget) {
    const { identityUrl, appCredId, appCredName, appCredSecret } = widget;

    if (cache.has('openstack-token-' + identityUrl)) {
        return cache.get('openstack-token-' + identityUrl);
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
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    };

    const url = identityUrl + '/v3/auth/tokens';
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error("Error fetching OpenStack auth token: " + response.status + response.statusText)
    }

    const token = response.headers.get('X-Subject-Token');
    const { token: { expires_at: expiresAt } } = await response.json();
    const ttlMillis = new Date(expiresAt) - new Date();
    const ttl = Math.floor(ttlMillis / 1000);

    cache.set('openstack-token-' + identityUrl, token, ttl);
    return token;
}
