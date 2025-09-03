import backrestProxyHandler from "./proxy";

const widget = {
  api: "{url}/v1.Backrest/{endpoint}",
  proxyHandler: backrestProxyHandler,

  mappings: {
    summary: {
      endpoint: "GetSummaryDashboard",
    },
  },
};

export default widget;
