import npmProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: npmProxyHandler,

  mappings: {
    hosts: {
      endpoint: "nginx/proxy-hosts",
    },
  },
};

export default widget;
