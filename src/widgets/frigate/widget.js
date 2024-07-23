import { asJson } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    stats: {
      endpoint: "stats",
      map: (data) => {
        const jsonData = asJson(data);
        return {
          num_cameras: jsonData?.cameras !== undefined ? Object.keys(jsonData?.cameras).length : 0,
          uptime: jsonData?.service?.uptime,
          version: jsonData?.service.version,
        };
      },
    },
    events: {
      endpoint: "events",
      map: (data) =>
        asJson(data)
          .slice(0, 5)
          .map((event) => ({
            id: event.id,
            camera: event.camera,
            label: event.label,
            start_time: new Date(event.start_time * 1000),
            thumbnail: event.thumbnail,
            score: event.data.score,
            type: event.data.type,
          })),
    },
  },
};

export default widget;
