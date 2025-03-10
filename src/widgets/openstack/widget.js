import openstackProxyHandler from "utils/proxy/handlers/openstack"; 

const widget =  {
  api: "{url}/{endpoint}" ,
  proxyHandler: openstackProxyHandler,

  mappings:  {
    servers:  {
      endpoint: "{version}/servers/detail",
      validate: ["servers"]
    },
    server:  {
      endpoint: "{version}/servers/{server}",
      validate: ["server"]
    },
    diagnostics:  {
      endpoint: "{version}/servers/{server}/diagnostics",
      validate: ["cpu0_time", "memory-rss", "memory-actual"]
    },
  },
};

export default widget;