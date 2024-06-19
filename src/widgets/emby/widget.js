import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/emby/{endpoint}?api_key={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    Sessions: {
      endpoint: "Sessions",
    },
    Count: {
      endpoint: "Items/Counts",
    },
    Unpause: {
      method: "POST",
      endpoint: "Sessions/{sessionId}/Playing/Unpause",
      segments: ["sessionId"],
    },
    Pause: {
      method: "POST",
      endpoint: "Sessions/{sessionId}/Playing/Pause",
      segments: ["sessionId"],
    },
  },
};

export default widget;
