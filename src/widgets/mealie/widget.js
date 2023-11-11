import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/groups/statistics",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
