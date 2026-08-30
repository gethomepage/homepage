import crowdsecProxyHandler from "./proxy";

const widget = {
  api: "{url}/v1/{endpoint}",
  loginURL: "{url}/v1/watchers/login",
  proxyHandler: crowdsecProxyHandler,

  mappings: {
    alerts: {
      endpoint: "alerts?limit=0&since=24h&with_decisions=false&include_capi=false",
    },
    bans: {
      endpoint: "alerts?decision_type=ban&include_capi=false&has_active_decision=1&with_decisions=false",
    },
  },
};

export default widget;
