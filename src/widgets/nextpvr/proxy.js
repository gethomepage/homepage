/* eslint-disable no-underscore-dangle */
import { xml2json } from "xml-js";

import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const saltedMd5 = require('salted-md5');

const proxyName = "nextpvrProxyHandler";

const logger = createLogger(proxyName);
let globalSid = null;

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


async function loginToNextPVR(endpoint, widget) {
    const api = widgets?.[widget.type]?.api;
    if (!api) {
        return [403, null];
    }
    // Create new session on NextPVR
    let url = new URL(formatApiCall(api, { endpoint, ...widget }));

    let [status, contentType, data] = await httpProxy(url);

    if (status !== 200) {
        logger.error("HTTP %d communicating with NextPVR. Data: %s", status, data.toString());
        return [status, data];
    }
    let dataAsJson;
    try {
        const dataDecoded = xml2json(data.toString(), { compact: true });
        dataAsJson = JSON.parse(dataDecoded);
    } catch (e) {
        logger.error("Error decoding NextPVR API data. Data: %s", data.toString());
        return [status, null];
    }
    // Create md5 hash of pin / salt to to md5 login
    const hashedSalt = saltedMd5(`:${saltedMd5(widget.pin)}:`, dataAsJson.rsp.salt._text);
    url = `${new URL(formatApiCall(api, { 'endpoint': 'session.login&md5=', 'url': widget.url }))}${hashedSalt}&sid=${dataAsJson.rsp.sid._text}`;

    [status, contentType, data] = await httpProxy(url);
    if (status !== 200) {
        logger.error("HTTP %d communicating with NextPVR. Data: %s", status, contentType, data.toString());
        return [status, data];
    }
    try {
        const dataDecoded = xml2json(data.toString(), { compact: true });
        dataAsJson = JSON.parse(dataDecoded);
        // Store the session id globally
        globalSid = dataAsJson.rsp.sid._text
    } catch (e) {
        logger.error("Error decoding NextPVR API data. Data: %s", data.toString());
        return [status, null];
    }
    logger.info('gettingSID')
    return [status, true];
}


async function fetchFromNextPVRAPI(endpoint, widget, sid) {
    const api = widgets?.[widget.type]?.api;
    if (!api) {
        return [403, null];
    }
    const url = `${new URL(formatApiCall(api, { endpoint, ...widget }))}&sid=${sid}`
    const [status, contentType, data] = await httpProxy(url);

    if (status !== 200) {
        logger.error("HTTP %d communicating with NextPVR. Data: %s", status, data.toString());
        return [status, data];
    }

    try {
        const dataDecoded = xml2json(data.toString(), { compact: true });
        return [status, JSON.parse(dataDecoded), contentType];
    } catch (e) {
        logger.error("Error decoding NextPVR API data. Data: %s", data.toString());
        return [status, null];
    }
}

export default async function nextPVRProxyHandler(req, res) {
    const widget = await getWidget(req);

    if (!globalSid) {
        await loginToNextPVR('session.initiate&ver=1.0&device=homepage', widget);
    }
    if (!widget) {
        return res.status(400).json({ error: "Invalid proxy service type" });
    }

    logger.debug("Getting streams from NextPVR API");
    // Calculate the number of upcoming recordings
    let [status, apiData] = await fetchFromNextPVRAPI('recording.list', widget, globalSid);

    if (status !== 200) {
        return res.status(status).json({ error: { message: "HTTP error communicating with NextPVR API", data: Buffer.from(apiData).toString() } });
    }

    let recordingCount
    if (Array.isArray(apiData.rsp.recordings.recording) === false) {
        if (apiData.rsp.recordings.recording) {
            recordingCount = 1;
        } else {
            recordingCount = 0;
        }
    } else {
        recordingCount = apiData.rsp.recordings.recording.length;
    }
    // Calculate the number of ready recordings
    [status, apiData] = await fetchFromNextPVRAPI('recording.list&filter=ready', widget, globalSid);

    if (status !== 200) {
        return res.status(status).json({ error: { message: "HTTP error communicating with NextPVR API", data: Buffer.from(apiData).toString() } });
    }
    let readyCount
    if (Array.isArray(apiData.rsp.recordings.recording) === false) {
        if (apiData.rsp.recordings.recording) {
            readyCount = 1;
        } else {
            readyCount = 0;
        }
    } else {
        readyCount = apiData.rsp.recordings.recording.length;
    }
    const data = {
        recordingCount,
        readyCount
    };

    return res.status(status).send(data);

}


