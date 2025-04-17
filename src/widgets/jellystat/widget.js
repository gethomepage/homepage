import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    getViewsByLibraryType: {
      endpoint: "stats/getViewsByLibraryType",
    },
  },
};

export default widget;
