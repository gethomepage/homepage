import backrestProxyHandler from "./proxy";


const widget = {
  api: "{url}/v1.Backrest/GetSummaryDashboard",
  proxyHandler: backrestProxyHandler,
  // allowedEndpoints: /\d\/num_plans|num_success|num_failure/,
};

export default widget;

