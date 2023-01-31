import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/actuator/metrics/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "libraries": {
      endpoint: "komga.libraries"
    },
    "series": {
      endpoint: "komga.series"
    },
    "books": {
      endpoint: "komga.books"
    },
  },
};

export default widget;