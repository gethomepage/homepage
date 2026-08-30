import crowdsecProxyHandler from "./proxy";

const widget = {
  api: "{url}/v1/{endpoint}",
  loginURL: "{url}/v1/watchers/login",
  proxyHandler: crowdsecProxyHandler,

  mappings: {
    alerts: {
      endpoint: "alerts?with_decisions=false",
    },
    alerts24h: {
      endpoint: "alerts?limit=0&since=24h&with_decisions=false",
    },
    bans: {
      endpoint: "alerts?decision_type=ban&origin=crowdsec&has_active_decision=1&with_decisions=false",
    },
  },
};

export default widget;
