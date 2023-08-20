import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://pro-api.coinmarketcap.com/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "v1/cryptocurrency/quotes/latest": {
      endpoint: "v1/cryptocurrency/quotes/latest",
      params: ["convert"],
      optionalParams: ["symbol", "slug"],
    },
  },
};

export default widget;
