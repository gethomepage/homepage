import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
// import { jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    workflows: {
      endpoint: "workflows?active=true",
      validate: ["data"],
    },
    executions: {
      endpoint: "executions?includeData=false&status=success",
      validate: ["data"],
    },
  },
};

export default widget;
