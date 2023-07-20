import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://dev.azure.com/{organization}/{project}/_apis/build/Builds?branchName={branchName}&definitions={definitionId}",
  proxyHandler: credentialedProxyHandler,
};

export default widget;