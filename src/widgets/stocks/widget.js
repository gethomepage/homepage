import stocksProxyHandler from "./proxy";

const widget = {
  api: `{url}`,
  proxyHandler: stocksProxyHandler,

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
    none: {},
  },
};

export default widget;
