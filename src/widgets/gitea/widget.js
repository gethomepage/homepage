import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}?access_token={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "allNotifications": {
      endpoint: "notifications",
    },
    "newNotifications": {
      endpoint: "notifications/new",
    },
  },
};

export default widget;
