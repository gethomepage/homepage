import octoPrintProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}?apikey={key}",
  proxyHandler: octoPrintProxyHandler,

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
