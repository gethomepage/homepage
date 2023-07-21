import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repositoryId}/pullrequests",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
