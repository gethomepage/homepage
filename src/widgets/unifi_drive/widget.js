import unifiDriveProxyHandler from "./proxy";

const widget = {
  api: "{url}{prefix}/api/{endpoint}",
  proxyHandler: unifiDriveProxyHandler,

  mappings: {
    "v1/systems/storage?type=detail": {
      endpoint: "v1/systems/storage?type=detail",
    },
  },
};

export default widget;
