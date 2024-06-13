import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    upstreams: {
      endpoint: "reverse_proxy/upstreams",
    },
  },
};

export default widget;
