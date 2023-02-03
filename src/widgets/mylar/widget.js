import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api?cmd={endpoint}&apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    issues: {
      endpoint: "getIndex"
    },
    series: {
      endpoint: "seriesjsonListing"
    },
    wanted: {
      endpoint: "getWanted"
    },
  },
};

export default widget;