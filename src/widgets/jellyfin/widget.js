import jellyfinProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: jellyfinProxyHandler,
  mappings: {
    Sessions: {
      endpoint: "emby/Sessions?api_key={key}",
    },
    Count: {
      endpoint: "emby/Items/Counts?api_key={key}",
    },
    Unpause: {
      method: "POST",
      endpoint: "emby/Sessions/{sessionId}/Playing/Unpause?api_key={key}",
      segments: ["sessionId"],
    },
    Pause: {
      method: "POST",
      endpoint: "emby/Sessions/{sessionId}/Playing/Pause?api_key={key}",
      segments: ["sessionId"],
    },
    // V2 Endpoints
    SessionsV2: {
      endpoint: "Sessions",
    },
    CountV2: {
      endpoint: "Items/Counts",
    },
    UnpauseV2: {
      method: "POST",
      endpoint: "Sessions/{sessionId}/Playing/Unpause",
      segments: ["sessionId"],
    },
    PauseV2: {
      method: "POST",
      endpoint: "Sessions/{sessionId}/Playing/Pause",
      segments: ["sessionId"],
    },
  },
};

export default widget;
