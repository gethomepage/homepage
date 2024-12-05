import { xml2json } from "xml-js";

import { racknerdDefaultFields } from "./component";

import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("racknerdProxyHandler");

async function requestEndpoint(apiBaseUrl, action, params) {
  const request = {
    method: "POST"
  };
  let qs = "";
  Object.entries(params).forEach(([key, value]) => {
    qs += `&${key}=${value}`;
  });
  const apiUrl = `${apiBaseUrl}?action=${action}${qs}`;
  const [status, , data] = await httpProxy(apiUrl, request);
  if (status !== 200) {
    logger.debug(`HTTP ${status} performing XMLRequest for ${action}`, data);
    throw new Error(`Failed fetching '${action}'`);
  }
  const response = {};
  try {
    const jsonData = JSON.parse(xml2json(`<root>${data}</root>`, {compact: true}));
    const responseElements = jsonData?.root || {};
    Object.entries(responseElements).forEach(([responseKey, responseValue]) => {
      /* eslint no-underscore-dangle: ["error", { "allow": ["_text"] }] */
      response[responseKey] = responseValue?._text || "";
    });
  } catch (e) {
    logger.debug(`Failed parsing ${action} response:`, data);
    throw new Error(`Failed parsing '${action}' response`);
  }

  return response;
}

export default async function racknerdProxyHandler(req, res) {
  const { group, service, index } = req.query;
  const serviceWidget = await getServiceWidget(group, service, index);

  if (!serviceWidget) {
    res.status(500).json({ error: { message: "Service widget not found" } });
    return;
  }

  if (!serviceWidget.url) {
    res.status(500).json({ error: { message: "Service widget url not configured" } });
    return;
  }

  const serviceWidgetUrl = new URL(serviceWidget.url);
  const apiBaseUrl = `${serviceWidgetUrl.protocol}//${serviceWidgetUrl.hostname}/api/client/command.php`;

  if (!serviceWidget.fields?.length > 0) {
    serviceWidget.fields = racknerdDefaultFields;
  }
  const requestStatus = ["status"].some((field) => serviceWidget.fields?.includes(field));
  const requestInfo = ["bandwidthused", "memoryusage", "hddtotal", "ipAddress"].some((field) => serviceWidget.fields?.includes(field));
  const params = {
    bw: serviceWidget.fields?.includes('bandwidthused') || serviceWidget.fields?.includes('bandwidthfree'),
    hdd: serviceWidget.fields?.includes('hddtotal'),
    ipAddr: serviceWidget.fields?.includes('ipAddress'),
    mem: serviceWidget.fields?.includes('memoryusage'),
    key: serviceWidget.key,
    hash: serviceWidget.hash,
  };

  await Promise.all([
    requestStatus ? requestEndpoint(apiBaseUrl, "status", params) : null,
    requestInfo ? requestEndpoint(apiBaseUrl, "info", params) : null,
  ])
  .then(([statusResponse, infoResponse]) => {
    const memoryItems = infoResponse.mem?.split(',');
    const hddItems = infoResponse.hdd?.split(',');
    const bandwidthItems = infoResponse.bw?.split(',');
    res.status(200).json({
      racknerd: {
        ipAddress: infoResponse.ipaddress || undefined,
        system: {
          status: statusResponse ? statusResponse.statusmsg : undefined,
          memoryused: memoryItems ? parseFloat(memoryItems[1], 10) : undefined,
          hdd_total: hddItems ? parseFloat(hddItems[0], 10) : undefined,
          bandwidth_total: bandwidthItems ? parseFloat(bandwidthItems[0], 10) : undefined,
          bandwidth_used: bandwidthItems ? parseFloat(bandwidthItems[1], 10) : undefined,
          bandwidth_free: bandwidthItems ? parseFloat(bandwidthItems[2], 10) : undefined,
          mem_total: memoryItems ? parseFloat(memoryItems[0], 10) : undefined,
          mem_free: memoryItems ? parseFloat(memoryItems[2], 10) : undefined,
          mem_percent: memoryItems ? parseFloat(memoryItems[3], 10) : undefined,
        }
      }
    });
  })
  .catch((error) => {
    res.status(500).json({ error: { message: error.message } });
  });
}
