import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/etapi/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "app-info": {
      endpoint: "app-info",
    },
    allnotes: {
      endpoint: "notes?search=note.id%20%3D%20%22root%22",
    },
  },
};

export default widget;
