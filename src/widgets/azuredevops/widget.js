import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://dev.azure.com/{organization}/{project}/_apis/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    pr: {
      endpoint: "git/repositories/{repositoryId}/pullrequests"
    },
    
    pipeline: {
      endpoint: "build/Builds?branchName={branchName}&definitions={definitionId}&$top=1"
    },
  },
};

export default widget;
