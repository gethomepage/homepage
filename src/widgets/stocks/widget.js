import stocksProxyHandler from "./proxy";

const widget = {
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
    sentiment: {
      endpoint: "compare",
      params: ["tickers"],
      optionalParams: ["days"],
    },
  },
};

export default widget;
