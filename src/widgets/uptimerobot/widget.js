import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/v2/{endpoint}?api_key={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    getmonitors: {
      method: "POST",
      endpoint: "getMonitors",
      body: "format=json&logs=1",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache",
      },
    },
  },
};

export default widget;
