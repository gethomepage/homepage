import omadaProxyHandler from "../omada/proxy";
// import genericProxyHandler from "../../utils/proxy/handlers/generic";

const widget = {
  api: "{url}/web/v1/{endpoint}",
  proxyHandler: omadaProxyHandler,

  mappings: {
    stats: {
      endpoint: "controller",
    }
  }
};

export default widget;
