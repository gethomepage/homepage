import jdownloaderProxyHandler from "./proxy";

const widget = {
  api: "https://api.jdownloader.org/{endpoint}/&signature={signature}",
  proxyHandler: jdownloaderProxyHandler,

  mappings: {
    unified: {
      endpoint: "/",
      signature: "",
    },
  },
};

export default widget;
