import snowflakeProxyHandler from "./proxy";

const widget = {
  api: "{url}/internal/metrics",
  proxyHandler: snowflakeProxyHandler,
};

export default widget;
