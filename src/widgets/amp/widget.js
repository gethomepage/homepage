import ampProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: ampProxyHandler,
  mappings: {
    login: {
      endpoint: "Core/Login",
    },
    getInstance: {
      endpoint: "ADSModule/GetInstance",
      
    },
  },
};

export default widget;
