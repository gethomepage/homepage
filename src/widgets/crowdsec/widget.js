import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    bans: {
      endpoint: "decisions?type=ban&origins=crowdsec",
    },
    captchas: {
      endpoint: "decisions?type=captcha&origins=crowdsec",
    },
    rateLimits: {
      endpoint: "decisions?type=rate-limit&origins=crowdsec",
    },
  },
};

export default widget;
