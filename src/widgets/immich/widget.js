import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/server-info/stats",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
