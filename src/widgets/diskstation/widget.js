import diskstationProxyHandler from "./proxy";

const widget = {
  api: "{url}/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method={endpoint}",
  proxyHandler: diskstationProxyHandler,

  mappings: {
    "list": {
      endpoint: "list&additional=transfer",
    },
  },
};

export default widget;
