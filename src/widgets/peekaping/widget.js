import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    monitors: {
      endpoint: "status-pages/slug/{slug}/monitors/homepage",
    },
  },
};

export default widget;
