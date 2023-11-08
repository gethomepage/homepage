import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/server-info/statistics",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
