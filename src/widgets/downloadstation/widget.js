import synologyProxyHandler from '../../utils/proxy/handlers/synology'

const widget = {
  // cgiPath and maxVersion are discovered at runtime, don't supply
  api: "{url}/webapi/{cgiPath}?api={apiName}&version={maxVersion}&method={apiMethod}",
  proxyHandler: synologyProxyHandler,

  mappings: {
    "list": {
      apiName: "SYNO.DownloadStation.Task",
      apiMethod: "list&additional=transfer",
      endpoint: "list"
    },
  },
};

export default widget;
