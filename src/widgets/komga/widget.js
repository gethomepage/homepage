import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/actuator/metrics/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "komga.libraries": {
      endpoint: "komga.libraries"
    },
    "komga.series": {
      endpoint: "komga.series"
    },
    "komga.books": {
      endpoint: "komga.books"
    },
  },
};

export default widget;