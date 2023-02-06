import synologyProxyHandler from '../../utils/proxy/handlers/synology'

const widget = {
  // cgiPath and maxVersion are discovered at runtime, don't supply
  api: "{url}/webapi/{cgiPath}?api={apiName}&version={maxVersion}&method={apiMethod}",
  proxyHandler: synologyProxyHandler,

  mappings: {
    "system_storage": {
      apiName: "SYNO.Core.System",
      apiMethod: "info&type=\"storage\"",
      endpoint: "system_storage"
    },
    "system_info": {
      apiName: "SYNO.Core.System",
      apiMethod: "info",
      endpoint: "system_info"
    },
    "utilization": {
      apiName: "SYNO.Core.System.Utilization",
      apiMethod: "get",
      endpoint: "utilization"
    }
  },
};

export default widget;
