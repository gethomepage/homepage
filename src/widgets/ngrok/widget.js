import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://api.ngrok.com/tunnels",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
