import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/emby/{endpoint}?api_key={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "Sessions": {
      endpoint: "Sessions",
    },
    "PlayControl": {
      method: "POST",
      enpoint: "Sessions/{sessionId}/Playing/{command}",
      segments: ["sessionId", "command"]
    }
  },
};

export default widget;
