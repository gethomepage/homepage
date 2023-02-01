import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}?api_key={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    Sessions: {
      endpoint: "Sessions",
    },
    PlayControl: {
      method: "POST",
      endpoint: "Sessions/{sessionId}/Playing/{command}",
      segments: ["sessionId", "command"],
    },
  },
};

export default widget;
