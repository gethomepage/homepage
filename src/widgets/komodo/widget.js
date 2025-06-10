import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    stacks: {
      endpoint: "read",
      method: "POST",
      body: {
        type: "GetStacksSummary",
        params: {},
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
  },
};

export default widget;
