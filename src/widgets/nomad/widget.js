import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    nodes: {
      endpoint: "nodes",
    },
    jobs: {
      endpoint: "jobs",
    },
    services: {
      endpoint: "services",
    },
    volumes: {
      endpoint: "volumes",
    },
    csi_volumes: {
      endpoint: "volumes?type=csi",
    }
  },
};

export default widget;
