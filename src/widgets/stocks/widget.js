import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: `https://finnhub.io/api/{endpoint}`,
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "stocks/quote": {
      // https://finnhub.io/docs/api/quote
      endpoint: "v1/quote",
      params: ["symbol"],
    },
    "stocks/market-status/us": {
      // https://finnhub.io/docs/api/market-status
      endpoint: "v1/stock/market-status",
      params: ["exchange"],
    },
  },
};

export default widget;
