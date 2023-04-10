import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://api.ngrok.com/{{endpoint}}",
  proxyHandler: credentialedProxyHandler,

  mapping: {
    "tunnels": {
      endpoint: "tunnels"
    },
  },
};

export default widget;
