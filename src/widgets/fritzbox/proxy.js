import { xml2json } from "xml-js";

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
    const responseElements = jsonData?.elements[0]?.elements[0]?.elements[0]?.elements || [];
    responseElements.forEach((element) => {
      response[element.name] = element.elements[0]?.text || "";
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
    res.status(500).json({ error: "Service widget not found" });
    return;
  }
  if (!serviceWidget.url) {
    res.status(500).json({ error: "Service widget url not configured" });
    return;
  }

  const serviceWidgetUrl = new URL(serviceWidget.url);
  const port = serviceWidgetUrl.protocol === "https:" ? 49443 : 49000;
  const apiBaseUrl = `${serviceWidgetUrl.protocol}//${serviceWidgetUrl.hostname}:${port}`;

  await Promise.all([
    requestEndpoint(apiBaseUrl, "WANIPConnection", "GetStatusInfo"),
    requestEndpoint(apiBaseUrl, "WANIPConnection", "GetExternalIPAddress"),
    requestEndpoint(apiBaseUrl, "WANCommonInterfaceConfig", "GetCommonLinkProperties"),
    requestEndpoint(apiBaseUrl, "WANCommonInterfaceConfig", "GetAddonInfos"),
  ])
    .then(([statusInfo, externalIPAddress, linkProperties, addonInfos]) => {
      res.status(200).json({
        connectionStatus: statusInfo.NewConnectionStatus,
        uptime: statusInfo.NewUptime,
        maxDown: linkProperties.NewLayer1DownstreamMaxBitRate,
        maxUp: linkProperties.NewLayer1UpstreamMaxBitRate,
        down: addonInfos.NewByteReceiveRate,
        up: addonInfos.NewByteSendRate,
        received: addonInfos.NewX_AVM_DE_TotalBytesReceived64,
        sent: addonInfos.NewX_AVM_DE_TotalBytesSent64,
        externalIPAddress: externalIPAddress.NewExternalIPAddress,
      });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
}
