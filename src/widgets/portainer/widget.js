import portainerProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: portainerProxyHandler,

  mappings: {
    "docker/containers/json": {
      endpoint: "endpoints/{env}/docker/containers/json",
    },
  },
};

export default widget;
