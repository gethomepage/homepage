import openstackProxyHandler from "utils/proxy/handlers/openstack"; 

const widget =  {
  api: "{url}/{endpoint}" ,
  proxyHandler: openstackProxyHandler,

  mappings:  {
    server:  {
      endpoint: "{version}/servers/{server}",
      validate: ["server"]
    },
    serverDiagnostics:  {
      endpoint: "{version}/servers/{server}/diagnostics",
      validate: ["cpu0_time", "memory-rss", "memory-actual"]
    },
  },
};

export default widget;