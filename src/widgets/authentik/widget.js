import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v3/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    users: {
      endpoint: "core/users/?page_size=1",
    },
    login: {
      endpoint: "events/events/per_month/?action=login",
    },
    loginv2: {
      endpoint: "events/events/volume/?action=login&&history_days=1",
    },
    login_failed: {
      endpoint: "events/events/per_month/?action=login_failed",
    },
    login_failedv2: {
      endpoint: "events/events/volume/?action=login_failed&&history_days=1",
    },
  },
};

export default widget;
