import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/rest/{endpoint}?u={user}&t={token}&s={salt}&v={version}&c={client}&f=json",
  proxyHandler: genericProxyHandler,

  mappings: {
    "getNowPlaying": {
      endpoint: "getNowPlaying",
    },
  },
};

export default widget;
