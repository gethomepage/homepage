import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://dev.azure.com/{organization}/{project}/_apis/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    pr: {
      endpoint: "git/repositories/BackEnd/pullrequests",
    },
    
    pipeline: {
      endpoint: "build/Builds?branchName=&definitions=141"
    },
  },
};

export default widget;
