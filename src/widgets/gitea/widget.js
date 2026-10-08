import giteaProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/v1/{endpoint}?access_token={key}",
  proxyHandler: giteaProxyHandler,

  // limit=1: only the X-Total-Count response header is needed
  mappings: {
    notifications: {
      endpoint: "notifications?limit=1",
    },
    issues: {
      endpoint: "repos/issues/search?type=issues&limit=1",
    },
    pulls: {
      endpoint: "repos/issues/search?type=pulls&limit=1",
    },
    repositories: {
      endpoint: "repos/search?limit=1",
    },
  },
};

export default widget;
