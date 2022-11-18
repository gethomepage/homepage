import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/v1/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    ip: {
      endpoint: "publicip/ip",
      validate: [
        "public_ip",
        "region",
        "country"
      ]
    },
  },
};

export default widget;
