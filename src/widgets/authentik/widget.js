import credentialedProxyHandler from "utils/proxies/credentialed";

const widget = {
  api: "{url}/api/v3/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "users": {
      endpoint: "core/users?page_size=1"
    },
    "login": {
      endpoint: "events/events/per_month/?action=login&query={}"
    },
    "login_failed": {
      endpoint: "events/events/per_month/?action=login_failed&query={}"
    },
  },
};

export default widget;
