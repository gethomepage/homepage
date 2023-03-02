import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v2/portfolio/performance?range={endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    today: {
      endpoint: "1d"
    },
    year: {
      endpoint: "1y"
    },
    max: {
      endpoint: "max"
    },
  },
};

export default widget;
