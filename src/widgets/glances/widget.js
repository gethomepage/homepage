import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{version}/{endpoint}",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
