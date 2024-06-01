import credentialedProxyHandler from "../../utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/get/domain/all",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
