import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "request/count": {
      endpoint: "request/count",
      validate: ["pending", "processing", "approved", "available"],
    },
    pendingRequests: {
      endpoint: "request?filter=pending",
    },
    tvDetails: {
      endpoint: "tv/{id}",
      segments: ["id"],
    },
    movieDetails: {
      endpoint: "movie/{id}",
      segments: ["id"],
    },
    updateRequestStatus: {
      method: "POST",
      endpoint: "request/{id}/{status}",
      segments: ["id", "status"],
    },
    mainSettings: {
      endpoint: "settings/main",
    },
  },
};

export default widget;
