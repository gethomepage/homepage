import createLogger from "utils/logger";
import genericProxyHandler from "utils/proxies/generic";
import widgets from "widgets/widgets";

const logger = createLogger("servicesProxy");

export default async function handler(req, res) {
  try {
    const { type } = req.query;
    const widget = widgets[type];

    if (!widget) {
      logger.debug("Unknown proxy service type: %s", type);
      return res.status(403).json({ error: "Unkown proxy service type" });
    }

    const serviceProxyHandler = widget.proxyHandler || genericProxyHandler;
    req.method = "GET";

    if (serviceProxyHandler instanceof Function) {
      // map opaque endpoints to their actual endpoint
      const mapping = widget?.mappings?.[req.query.endpoint];
      const mappingParams = mapping.params;
      const map = mapping?.map;
      const endpoint = mapping?.endpoint;
      const endpointProxy = mapping?.proxyHandler || serviceProxyHandler;
      req.method = mapping?.method || "GET";

      if (!endpoint) {
        logger.debug("Unsupported service endpoint: %s", type);
        return res.status(403).json({ error: "Unsupported service endpoint" });
      }

      if (req.query.params) {
        const queryParams = JSON.parse(req.query.params);
        const query = new URLSearchParams(mappingParams.map((p) => [p, queryParams[p]]));
        req.query.endpoint = `${endpoint}?${query}`;
      } else {
        req.query.endpoint = endpoint;
      }

      if (endpointProxy instanceof Function) {
        return endpointProxy(req, res, map);
      }

      return serviceProxyHandler(req, res, map);
    }

    logger.debug("Unknown proxy service type: %s", type);
    return res.status(403).json({ error: "Unkown proxy service type" });
  } catch (ex) {
    logger.error(ex);
    return res.status(500).send({ error: "Unexpected error" });
  }
}
