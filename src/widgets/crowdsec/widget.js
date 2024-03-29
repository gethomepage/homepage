import crowdsecProxyHandler from "./proxy";

const widget = {
  api: "{url}/v1/{endpoint}",
  loginURL: "{url}/v1/watchers/login",
  proxyHandler: crowdsecProxyHandler,

  mappings: {
    alerts: {
      endpoint: "alerts",
    },
    bans: {
      endpoint: "alerts?decision_type=ban&origin=crowdsec&has_active_decision=1",
    },
  },
};

export default widget;
