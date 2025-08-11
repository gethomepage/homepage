import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "docker/dashboard": {
      endpoint: "docker/{env}/dashboard",
    },
    "kubernetes/applications": {
      endpoint: "kubernetes/{env}/applications/count",
    },
    "kubernetes/services": {
      endpoint: "kubernetes/{env}/services/count",
    },
    "kubernetes/namespaces": {
      endpoint: "kubernetes/{env}/namespaces/count",
    },
  },
};

export default widget;
