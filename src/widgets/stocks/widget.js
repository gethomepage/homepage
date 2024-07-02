import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: `https://finnhub.io/api/{endpoint}`,
  proxyHandler: credentialedProxyHandler,

  mappings: {
    quote: {
      // https://finnhub.io/docs/api/quote
      endpoint: "v1/quote",
      params: ["symbol"],
    },
    status: {
      // https://finnhub.io/docs/api/market-status
      endpoint: "v1/stock/market-status",
      params: ["exchange"],
    },
  },
};

export default widget;
