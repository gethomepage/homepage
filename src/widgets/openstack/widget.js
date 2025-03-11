import openstackProxyHandler from "utils/proxy/handlers/openstack";

const widget = {
  api: "{url}/{version}/{endpoint}",
  proxyHandler: openstackProxyHandler,

  mappings: {
    servers: {
      endpoint: "servers/detail",
      validate: ["servers"],
    },
    server: {
      endpoint: "servers/{server}",
      validate: ["server"],
    },
    diagnostics: {
      endpoint: "servers/{server}/diagnostics",
      validate: ["cpu0_time", "memory-rss", "memory-actual"],
    },
  },
};

export default widget;
