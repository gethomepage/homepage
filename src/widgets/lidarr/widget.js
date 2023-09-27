import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    artist: {
      endpoint: "artist",
    },
    "wanted/missing": {
      endpoint: "wanted/missing",
    },
    "queue/status": {
      endpoint: "queue/status",
    },
    calendar: {
      endpoint: "calendar",
      params: ["start", "end", "unmonitored", "includeArtist"],
    },
  },
};

export default widget;
