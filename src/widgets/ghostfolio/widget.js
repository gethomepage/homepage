import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    today: {
      endpoint: "api/v2/portfolio/performance?range=1d",
    },
    year: {
      endpoint: "api/v2/portfolio/performance?range=1y",
    },
    max: {
      endpoint: "api/v2/portfolio/performance?range=max",
    },
    userInfo: {
      endpoint: "api/v1/user",
    },
  },
};

export default widget;
