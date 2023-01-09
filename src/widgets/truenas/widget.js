import { jsonArrayFilter } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import genericProxyHandler from "utils/proxy/handlers/generic";
import getServiceWidget from "utils/config/service-helpers";

const widget = {
  api: "{url}/api/v2.0/{endpoint}",
  proxyHandler: async (req, res, map) => { // choose proxy handler based on widget settings
    const { group, service } = req.query;
  
    if (group && service) {
      const widgetOpts = await getServiceWidget(group, service);
      let handler;
      if (widgetOpts.username && widgetOpts.password) {
        handler = genericProxyHandler;
      } else if (widgetOpts.key) {
        handler = credentialedProxyHandler;
      }

      if (handler) {
        return handler(req, res, map);
      } 
        
      return res.status(500).json({ error: "Username / password or API key required" });
    }
    
    return res.status(500).json({ error: "Error parsing widget request" });
  },

  mappings: {
    alerts: {
      endpoint: "alert/list",
      map: (data) => ({
        pending: jsonArrayFilter(data, (item) => item?.dismissed === false).length,
      }),
    },
    status: {
      endpoint: "system/info",
      validate: [
        "loadavg",
        "uptime_seconds"
      ]
    },
  },
};

export default widget;
