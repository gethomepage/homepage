import yahooFinanceProxyHandler from "./proxy";

const widget = {
  proxyHandler: yahooFinanceProxyHandler,
  allowedEndpoints: /^quote$/,
};

export default widget;
