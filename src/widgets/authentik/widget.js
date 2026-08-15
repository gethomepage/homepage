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
    login_failed: {
      endpoint: "events/events/per_month/?action=login_failed",
    },
    authorizations: {
      endpoint: "events/events/per_month/?action=authorize_application",
    },
    datav2: {
      endpoint: "events/events/volume/?actions=login&actions=login_failed&actions=authorize_application&history_days=1",
    },
  },
};

export default widget;
