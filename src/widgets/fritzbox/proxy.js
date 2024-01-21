import { xml2json } from "xml-js";

import { fritzboxDefaultFields } from "./component";

import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("fritzboxProxyHandler");

async function requestEndpoint(apiBaseUrl, service, action) {
  const servicePath = service === "WANIPConnection" ? "WANIPConn1" : "WANCommonIFC1";
  const params = {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset='utf-8'",
      SoapAction: `urn:schemas-upnp-org:service:${service}:1#${action}`,
    },
    body:
      "<?xml version='1.0' encoding='utf-8'?>" +
      "<s:Envelope s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/' xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'>" +
      "<s:Body>" +
      `<u:${action} xmlns:u='urn:schemas-upnp-org:service:${service}:1' />` +
      "</s:Body>" +
      "</s:Envelope>",
  };
  const apiUrl = `${apiBaseUrl}/igdupnp/control/${servicePath}`;
  const [status, , data] = await httpProxy(apiUrl, params);
  if (status !== 200) {
    logger.debug(`HTTP ${status} performing SoapRequest for ${service}->${action}`, data);
    throw new Error(`Failed fetching '${action}'`);
  }
  const response = {};
  try {
    const jsonData = JSON.parse(xml2json(data));
    const responseElements = jsonData?.elements?.[0]?.elements?.[0]?.elements?.[0]?.elements || [];
    responseElements.forEach((element) => {
      response[element.name] = element.elements?.[0].text || "";
    });
  } catch (e) {
    logger.debug(`Failed parsing ${service}->${action} response:`, data);
    throw new Error(`Failed parsing '${action}' response`);
  }

  return response;
}

export default async function fritzboxProxyHandler(req, res) {
  const { group, service } = req.query;
  const serviceWidget = await getServiceWidget(group, service);

  if (!serviceWidget) {
    res.status(500).json({ error: { message: "Service widget not found" } });
    return;
  }

  if (!serviceWidget.url) {
    res.status(500).json({ error: { message: "Service widget url not configured" } });
    return;
  }

  const serviceWidgetUrl = new URL(serviceWidget.url);
  const port = serviceWidgetUrl.protocol === "https:" ? 49443 : 49000;
  const apiBaseUrl = `${serviceWidgetUrl.protocol}//${serviceWidgetUrl.hostname}:${port}`;

  if (!serviceWidget.fields?.length > 0) {
    serviceWidget.fields = fritzboxDefaultFields;
  }
  const requestStatusInfo = ["connectionStatus", "uptime"].some((field) => serviceWidget.fields.includes(field));
  const requestLinkProperties = ["maxDown", "maxUp"].some((field) => serviceWidget.fields.includes(field));
  const requestAddonInfos = ["down", "up", "received", "sent"].some((field) => serviceWidget.fields.includes(field));
  const requestExternalIPAddress = ["externalIPAddress"].some((field) => serviceWidget.fields.includes(field));

  await Promise.all([
    requestStatusInfo ? requestEndpoint(apiBaseUrl, "WANIPConnection", "GetStatusInfo") : null,
    requestLinkProperties ? requestEndpoint(apiBaseUrl, "WANCommonInterfaceConfig", "GetCommonLinkProperties") : null,
    requestAddonInfos ? requestEndpoint(apiBaseUrl, "WANCommonInterfaceConfig", "GetAddonInfos") : null,
    requestExternalIPAddress ? requestEndpoint(apiBaseUrl, "WANIPConnection", "GetExternalIPAddress") : null,
  ])
    .then(([statusInfo, linkProperties, addonInfos, externalIPAddress]) => {
      res.status(200).json({
        connectionStatus: statusInfo?.NewConnectionStatus || "Unconfigured",
        uptime: statusInfo?.NewUptime || 0,
        maxDown: linkProperties?.NewLayer1DownstreamMaxBitRate || 0,
        maxUp: linkProperties?.NewLayer1UpstreamMaxBitRate || 0,
        down: addonInfos?.NewByteReceiveRate || 0,
        up: addonInfos?.NewByteSendRate || 0,
        received: addonInfos?.NewX_AVM_DE_TotalBytesReceived64 || 0,
        sent: addonInfos?.NewX_AVM_DE_TotalBytesSent64 || 0,
        externalIPAddress: externalIPAddress?.NewExternalIPAddress || null,
      });
    })
    .catch((error) => {
      res.status(500).json({ error: { message: error.message } });
    });
}
