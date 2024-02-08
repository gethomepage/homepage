import synologyProxyHandler from "../../utils/proxy/handlers/synology";

const widget = {
  // Variables to be filled at runtime
  api: "{url}/webapi/{cgiPath}?api={apiName}&version={maxVersion}&method={apiMethod}",
  proxyHandler: synologyProxyHandler,

  mappings: {
    gatewayList: {
      apiName: "SYNO.Core.Network.Router.Gateway.List",
      apiMethod: "get&iptype=ipv4&type=wan",
      endpoint: "gatewayList",
    },
  },
};

export default widget;
