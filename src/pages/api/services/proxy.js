import { formatApiCall } from "utils/proxy/api-helpers";
import createLogger from "utils/logger";
import genericProxyHandler from "utils/proxy/handlers/generic";
import widgets from "widgets/widgets";
import calendarProxyHandler from "widgets/calendar/proxy";
import getServiceWidget from "utils/config/service-helpers";

const logger = createLogger("servicesProxy");

export default async function handler(req, res) {
  try {
    const { service, group } = req.query;
    const serviceWidget = await getServiceWidget(group, service);
    let type = serviceWidget?.type;

    // exceptions
    if (type === "calendar") type = "ical";
    else if (service === "unifi_console" && group === "unifi_console") type = "unifi_console";

    const widget = widgets[type];

    if (!widget) {
      logger.debug("Unknown proxy service type: %s", type);
      return res.status(403).json({ error: "Unkown proxy service type" });
    }

    const serviceProxyHandler = widget.proxyHandler || genericProxyHandler;

    if (serviceProxyHandler instanceof Function) {
      // quick return for no endpoint services, calendar is an exception
      if (!req.query.endpoint || serviceProxyHandler === calendarProxyHandler) {
        return serviceProxyHandler(req, res);
      }

      // map opaque endpoints to their actual endpoint
      if (widget?.mappings) {
        const mapping = widget?.mappings?.[req.query.endpoint];
        const mappingParams = mapping?.params;
        const optionalParams = mapping?.optionalParams;
        const map = mapping?.map;
        const endpoint = mapping?.endpoint;
        const endpointProxy = mapping?.proxyHandler || serviceProxyHandler;

        if (mapping.method && mapping.method !== req.method) {
          logger.debug("Unsupported method: %s", req.method);
          return res.status(403).json({ error: "Unsupported method" });
        }

        if (!endpoint) {
          logger.debug("Unsupported service endpoint: %s", type);
          return res.status(403).json({ error: "Unsupported service endpoint" });
        }

        req.method = mapping?.method || "GET";
        if (mapping?.body) req.body = mapping?.body;
        req.query.endpoint = endpoint;

        if (req.query.segments) {
          const segments = JSON.parse(req.query.segments);
          let validSegments = true;
          Object.keys(segments).forEach((key) => {
            if (!mapping.segments.includes(key)) {
              logger.debug("Unsupported segment: %s", key);
              validSegments = false;
            } else if (segments[key].includes("/") || segments[key].includes("\\") || segments[key].includes("..")) {
              logger.debug("Unsupported segment value: %s", segments[key]);
              validSegments = false;
            }
          });
          if (!validSegments) return res.status(403).json({ error: "Unsupported segment" });
          req.query.endpoint = formatApiCall(endpoint, segments);
        }

        if (req.query.query && (mappingParams || optionalParams)) {
          const queryParams = JSON.parse(req.query.query);

          let filteredOptionalParams = [];
          if (optionalParams) filteredOptionalParams = optionalParams.filter((p) => queryParams[p] !== undefined);

          let params = [];
          if (mappingParams) params = params.concat(mappingParams);
          if (filteredOptionalParams) params = params.concat(filteredOptionalParams);

          const query = new URLSearchParams(params.map((p) => [p, queryParams[p]]));
          req.query.endpoint = `${req.query.endpoint}?${query}`;
        }

        if (mapping?.headers) {
          req.extraHeaders = mapping.headers;
        }

        if (endpointProxy instanceof Function) {
          return endpointProxy(req, res, map);
        }

        return serviceProxyHandler(req, res, map);
      }

      if (widget.allowedEndpoints instanceof RegExp) {
        if (widget.allowedEndpoints.test(req.query.endpoint)) {
          return serviceProxyHandler(req, res);
        }
      }

      logger.debug("Unmapped proxy request.");
      return res.status(403).json({ error: "Unmapped proxy request." });
    }

    logger.debug("Unknown proxy service type: %s", type);
    return res.status(403).json({ error: "Unkown proxy service type" });
  } catch (e) {
    if (e) logger.error(e);
    return res.status(500).send({ error: "Unexpected error" });
  }
}
