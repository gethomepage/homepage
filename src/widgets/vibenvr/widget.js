import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/health",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
