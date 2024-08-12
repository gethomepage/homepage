import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/ping",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
