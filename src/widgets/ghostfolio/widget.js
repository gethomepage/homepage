import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    today: {
      endpoint: "v2/portfolio/performance?range=1d",
    },
    year: {
      endpoint: "v2/portfolio/performance?range=1y",
    },
    max: {
      endpoint: "v2/portfolio/performance?range=max",
    },
    userInfo: {
      endpoint: "v1/user",
    },
  },
};

export default widget;
