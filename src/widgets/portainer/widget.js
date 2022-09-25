import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/api/endpoints/{env}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "docker/containers/json": {
      endpoint: "docker/containers/json",
      params: ["all"],
    },
  },
};

export default widget;
