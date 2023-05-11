import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}?access_token={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "notifications": {
      endpoint: "v1/notifications", // required scope: notification
    },
    "user": {
      endpoint: "v1/user",
    },
    "repos": {
      endpoint: "v1/user/repos", // required scope: repo
    }
  },
};

export default widget;
