import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    stats: {
      endpoint: "DownloadStats/GetTotalDownloadStats",
    },
  },
};

export default widget;
