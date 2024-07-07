import { asJson } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

// export default widget;
const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "stats": {
      endpoint: "stats",
      map: (data) => {
        const jsonData = asJson(data);
        return {
          num_cameras: jsonData?.cameras !== undefined ? Object.keys(jsonData?.cameras).length : 0,
          uptime: jsonData?.service?.uptime,
          version: jsonData?.service.version,
        }
      },
    },
  },
};

export default widget;
