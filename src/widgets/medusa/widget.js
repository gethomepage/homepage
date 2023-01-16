import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{key}/{endpoint}/",
  proxyHandler: genericProxyHandler,

  mappings: {
    stats: {
      endpoint: "?cmd=shows.stats",
      validate: [
        "data"
      ]
    },
    future: {
      endpoint: "?cmd=future",
      validate: [
        "data"
      ]
    }
  }
};

export default widget;
