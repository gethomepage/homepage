import beszelProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: beszelProxyHandler,

  mappings: {
    authv1: {
      endpoint: "admins/auth-with-password",
    },
    authv2: {
      endpoint: "collections/_superusers/auth-with-password",
    },
    systems: {
      endpoint: "collections/systems/records?page=1&perPage=500&sort=%2Bcreated",
    },
  },
};

export default widget;
