import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    printer_stats: {
      endpoint: "printer",
    },
    job_stats: {
      endpoint: "job",
    },
  },
};

export default widget;
