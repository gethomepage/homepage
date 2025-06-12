import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    getViewsByLibraryType: {
      endpoint: "stats/getViewsByLibraryType",
      params: ["days"],
    },
  },
};

export default widget;
