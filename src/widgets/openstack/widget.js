import { validate } from "compare-versions";
import openstackProxyHandler from "utils/proxy/handlers/openstack"; 

const widget =  {
  api: "{url}/{endpoint}" ,
  proxyHandler: openstackProxyHandler,

  mappings:  {
    server:  {
      endpoint: "v2.1/servers/{server}",
      validate: ["server"]
    },
    serverDiagnostics:  {
      endpoint: "v2.1/servers/{server}/diagnostics",
      validate: ["cpu0_time", "memory-rss", "memory-actual"]
    },
  },
};

export default widget;