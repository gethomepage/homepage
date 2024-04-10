import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}&access_key={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    SubscribeList: {
      headers: {
        "User-Agent": "Mozilla/5.0", // Crowdsec requires a user-agent
        "Content-Type": "application/json",
      },
      endpoint: "api/subscribe/list",
      params: ["media_type"],
    },
    GetSites: {
      endpoint: "api/site/get_sites",
      params: ["refreshInterval"],
    },
    SitesOverview: {
      headers: {
        "User-Agent": "Mozilla/5.0", // Crowdsec requires a user-agent
        "Content-Type": "application/json",
      },
      endpoint: "api/site/overview",
      params: ["refreshInterval"],
    },
  },
};

export default widget;
