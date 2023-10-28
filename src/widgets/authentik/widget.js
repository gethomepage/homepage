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
  },
};

export default widget;
